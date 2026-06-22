// ─── Vibration Calculator (Sine + Random) ─────────────────────────────────
const VC_G = 9.80665;
const VC_LOG2_10 = 10 * Math.log10(2);

// ── Tab switcher ──
export function vcSwitchTab(tab, btn) {
  document.querySelectorAll('.vc-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.vc-content').forEach(c => c.classList.remove('active'));
  document.getElementById('vc-'+tab).classList.add('active');
  btn.classList.add('active');
  if (tab === 'sine') vcUpdateSineChart();
  if (tab === 'random') vcCalcAndPlotRandom();
}

// ── SINE PRESETS ──
const VC_SINE_PRESETS = {
  iec_cls1: [{f:10,a:'',d:0.75},{f:57.5,a:0.5,d:''},{f:150,a:0.5,d:''}],
  iec_cls2: [{f:10,a:'',d:1.5},{f:58.1,a:1.0,d:''},{f:150,a:1.0,d:''}],
  iec_cls3: [{f:10,a:'',d:3.5},{f:60.0,a:5.0,d:''},{f:150,a:5.0,d:''}],
  mil_sine_basic: [{f:5,a:'',d:5.08},{f:15.92,a:1.0,d:''},{f:500,a:1.0,d:''}],
  sine_custom: [{f:10,a:'',d:1.0},{f:100,a:1.0,d:''}]
};

export function vcAddSineRow(f='', a='', d='') {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding:4px"><input type="number" class="vc-input" value="${f}" step="any" min="0" oninput="if(this.value<0)this.value=Math.abs(this.value); vcUpdateSineChart()"></td>
    <td style="padding:4px"><input type="number" class="vc-input" value="${a}" step="any" placeholder="Auto" oninput="vcUpdateSineChart()"></td>
    <td style="padding:4px"><input type="number" class="vc-input" value="${d}" step="any" placeholder="Auto" oninput="vcUpdateSineChart()"></td>
    <td style="padding:4px;text-align:center"><button class="vc-del" onclick="this.closest('tr').remove();vcUpdateSineChart()">✕</button></td>`;
  document.getElementById('vcSineTbody').appendChild(tr);
}

export function vcLoadSine() {
  const k = document.getElementById('vcSinePreset').value;
  if (!k || !VC_SINE_PRESETS[k]) return;
  document.getElementById('vcSineTbody').innerHTML = '';
  VC_SINE_PRESETS[k].forEach(p => vcAddSineRow(p.f, p.a===''?'':p.a, p.d===''?'':p.d));
  vcCalcSine();
}

function vcFillSinePoint(pt) {
  const res = {...pt};
  if (!isNaN(res.f)) {
    if (!isNaN(res.d) && isNaN(res.a)) {
      res.a = Math.pow(2*Math.PI*res.f, 2) * (res.d/2000) / VC_G;
      res.a = parseFloat(res.a.toFixed(6));
      res.disp_ctrl = true;
    } else if (!isNaN(res.a) && isNaN(res.d)) {
      res.d = (res.a * VC_G * 2000) / Math.pow(2*Math.PI*res.f, 2);
      res.d = parseFloat(res.d.toFixed(6));
      res.accel_ctrl = true;
    }
  }
  return res;
}

export function vcCalcSine() {
  const rows = document.querySelectorAll('#vcSineTbody tr');
  let data = [];
  rows.forEach(r => {
    const inps = r.querySelectorAll('input');
    data.push({f:parseFloat(inps[0].value), a:parseFloat(inps[1].value), d:parseFloat(inps[2].value)});
  });
  data = data.filter(p => !isNaN(p.f)).sort((a,b) => a.f-b.f);
  let result = [];
  for (let i = 0; i < data.length - 1; i++) {
    let p1 = vcFillSinePoint(data[i]);
    let p2 = vcFillSinePoint(data[i+1]);
    result.push(p1);
    if (p1.disp_ctrl && p2.accel_ctrl) {
      let fc = 22.288 * Math.sqrt(p2.a / p1.d);
      if (fc > p1.f && fc < p2.f) result.push({f:parseFloat(fc.toFixed(3)), a:parseFloat(p2.a.toFixed(4)), d:parseFloat(p1.d.toFixed(4))});
    }
  }
  if (data.length) result.push(vcFillSinePoint(data[data.length-1]));
  document.getElementById('vcSineTbody').innerHTML = '';
  result.forEach(p => vcAddSineRow(p.f, p.a, p.d));
  vcUpdateSineChart();
}

export function vcUpdateSineTime() {
  const rows = document.querySelectorAll('#vcSineTbody tr');
  let freqs = [];
  rows.forEach(r => { const f=parseFloat(r.querySelectorAll('input')[0].value); if(!isNaN(f)) freqs.push(f); });
  const el = document.getElementById('vcSineTime');
  if (freqs.length < 2) { el.textContent='--'; return; }
  const rate  = parseFloat(document.getElementById('vcSweepRate').value);
  const count = parseFloat(document.getElementById('vcSweepCount').value);
  const fMin  = Math.min(...freqs), fMax = Math.max(...freqs);
  if (fMin<=0 || fMax<=fMin || isNaN(rate)||rate<=0 || isNaN(count)||count<=0) { el.textContent='参數錯誤'; return; }
  const totalMins = (Math.log2(fMax/fMin)/rate)*count;
  const h=Math.floor(totalMins/60), m=Math.floor(totalMins%60), s=Math.round((totalMins*60)%60);
  el.textContent = (h?`${h}h `:'') + `${m}m ${s}s`;
}

export function vcUpdateSineChart() {
  const rows = document.querySelectorAll('#vcSineTbody tr');
  let pts = [];
  rows.forEach(r => {
    const inps = r.querySelectorAll('input');
    const f=parseFloat(inps[0].value), a=parseFloat(inps[1].value);
    if(!isNaN(f)&&!isNaN(a)) pts.push({f,a});
  });
  pts.sort((a,b)=>a.f-b.f);
  vcUpdateSineTime();
  if (!pts.length || !window.Plotly) return;
  const trace = {x:pts.map(d=>d.f), y:pts.map(d=>d.a), mode:'lines+markers', type:'scatter',
    line:{color:'#63b3ed',width:3}, marker:{size:7,color:'#fff',line:{color:'#63b3ed',width:2}}};
  const layout = {
    margin:{l:55,r:15,t:15,b:45}, paper_bgcolor:'rgba(13,20,71,0)', plot_bgcolor:'rgba(13,20,71,0)',
    xaxis:{title:'Frequency (Hz)',type:'log',gridcolor:'rgba(99,179,237,.1)',tickfont:{color:'#94a3b8'},titlefont:{color:'#94a3b8',size:11}},
    yaxis:{title:'Acceleration (g Peak)',type:'log',gridcolor:'rgba(99,179,237,.1)',tickfont:{color:'#94a3b8'},titlefont:{color:'#94a3b8',size:11}},
    showlegend:false
  };
  Plotly.newPlot('vcSinePlot', [trace], layout, {displayModeBar:false, responsive:true});
}

// ── RANDOM LOGIC ──
let vcRandUnit = 'G';

const VC_RAND_PROFILES = {
  mil_cat4:     [{f:10,p:0.015},{f:40,p:0.015},{f:500,p:0.00015}],
  mil_cat20:    [{f:5,p:0.006},{f:100,p:0.006},{f:500,p:0.002}],
  mil_cat24:    [{f:20,p:0.04},{f:1000,p:0.04},{f:2000,p:0.01}],
  gr63_trans:   [{f:5,p:0.001},{f:20,p:0.01},{f:500,p:0.01}],
  ista_3a:      [{f:1,p:0.0001},{f:4,p:0.01},{f:16,p:0.01},{f:40,p:0.001},{f:80,p:0.001},{f:200,p:0.00001}],
  ista_6amazon: [{f:1,p:0.0001},{f:4,p:0.01},{f:16,p:0.01},{f:40,p:0.001},{f:80,p:0.001},{f:200,p:0.00001}],
  astm_schA:    [{f:1,p:0.000072},{f:2,p:0.018},{f:4,p:0.018},{f:5,p:0.00072},{f:8,p:0.00072},{f:16,p:0.0036},{f:25,p:0.0036},{f:31.5,p:0.00072},{f:40,p:0.0036},{f:80,p:0.0036},{f:100,p:0.00036},{f:200,p:0.000072}],
  astm_schB:    [{f:1,p:0.0008},{f:2,p:0.008},{f:42,p:0.00008},{f:50,p:0.0003},{f:120,p:0.0003},{f:200,p:0.00000015}],
  iec_M:        [{f:5,p:0.0001},{f:20,p:0.01},{f:150,p:0.01},{f:500,p:0.001}],
  iec_H:        [{f:2,p:0.001},{f:20,p:0.02},{f:300,p:0.02},{f:1000,p:0.002}]
};

export function vcAddRandRow(f='', p='', isFirst=false) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding:4px"><input type="number" class="vc-input" value="${f}" step="any" min="0" oninput="if(this.value<0)this.value=Math.abs(this.value); vcHandleRandInput(this,'f')"></td>
    <td style="padding:4px"><input type="number" class="vc-input" value="${p}" step="any" min="0" oninput="if(this.value<0)this.value=Math.abs(this.value); vcHandleRandInput(this,'p')"></td>
    <td style="padding:4px"><input type="number" class="vc-input" step="any" oninput="vcHandleRandInput(this,'s')" ${isFirst?'disabled placeholder="N/A"':''}></td>
    <td style="padding:4px;text-align:center">${isFirst?'':`<button class="vc-del" onclick="this.closest('tr').remove();vcRecalcSlopes()">✕</button>`}</td>`;
  document.getElementById('vcRandTbody').appendChild(tr);
}

export function vcLoadRandom() {
  const k = document.getElementById('vcRandPreset').value;
  if (!k || !VC_RAND_PROFILES[k]) return;
  if (vcRandUnit !== 'G') vcSetUnit('G');
  const data = VC_RAND_PROFILES[k];
  document.getElementById('vcRandTbody').innerHTML = '';
  data.forEach((pt, i) => vcAddRandRow(pt.f, pt.p, i === 0));
  vcRecalcSlopes();
}

export function vcSetUnit(u) {
  if (vcRandUnit === u) return;
  const factor = (u === 'ms2') ? Math.pow(VC_G,2) : (1/Math.pow(VC_G,2));
  vcRandUnit = u;
  document.getElementById('vcUnitG').classList.toggle('active', u==='G');
  document.getElementById('vcUnitMs2').classList.toggle('active', u==='ms2');
  document.getElementById('vcThPsd').textContent = u==='ms2'? 'Value ((m/s²)²/Hz)' : 'Value (g²/Hz)';
  document.getElementById('vcUnitGrmsLbl').textContent = u==='ms2'? 'm/s²' : 'g';
  document.getElementById('vcUnitPeakLbl').textContent = u==='ms2'? 'm/s²' : 'G';
  document.querySelectorAll('#vcRandTbody .vc-input').forEach((inp,i) => {
    if (i % 3 === 1) {
      const v = parseFloat(inp.value);
      if (!isNaN(v)) inp.value = parseFloat((v*factor).toFixed(8));
    }
  });
  vcCalcAndPlotRandom();
}

export function vcHandleRandInput(el, type) {
  const rows = Array.from(document.querySelectorAll('#vcRandTbody tr'));
  const row  = el.closest('tr');
  const idx  = rows.indexOf(row);
  if (type === 's' && idx > 0) {
    const prevInps = rows[idx-1].querySelectorAll('input');
    const inps     = row.querySelectorAll('input');
    const pf=parseFloat(prevInps[0].value), pp=parseFloat(prevInps[1].value);
    const cf=parseFloat(inps[0].value), sl=parseFloat(el.value);
    if (pf>0&&pp>0&&cf>pf&&!isNaN(sl)) {
      inps[1].value = (pp * Math.pow(cf/pf, sl/VC_LOG2_10)).toFixed(8);
    }
  }
  vcRecalcSlopes(type, el);
}

export function vcRecalcSlopes(type, activeEl) {
  const rows = document.querySelectorAll('#vcRandTbody tr');
  document.getElementById('vcPtsInfo').textContent = rows.length + ' pts';
  rows.forEach((row, i) => {
    const inps = row.querySelectorAll('input');
    const slp  = inps[2];
    if (i === 0) { slp.disabled=true; slp.value=''; slp.placeholder='N/A'; return; }
    slp.disabled = false; slp.placeholder = '';
    const prevInps = rows[i-1].querySelectorAll('input');
    const f1=parseFloat(prevInps[0].value), w1=parseFloat(prevInps[1].value);
    const f2=parseFloat(inps[0].value),     w2=parseFloat(inps[1].value);
    if (f1>0&&w1>0&&f2>f1&&w2>0 && document.activeElement !== slp) {
      slp.value = ((Math.log10(w2/w1)/Math.log10(f2/f1))*VC_LOG2_10).toFixed(2);
    }
  });
  vcCalcAndPlotRandom();
}

export function vcCalcAndPlotRandom() {
  const rows = document.querySelectorAll('#vcRandTbody tr');
  let data = [];
  rows.forEach(r => {
    const inps = r.querySelectorAll('input');
    const f=parseFloat(inps[0].value), p=parseFloat(inps[1].value);
    if(!isNaN(f)&&!isNaN(p)) data.push({f,p});
  });
  data.sort((a,b)=>a.f-b.f);
  if (data.length < 2) { if(window.Plotly) Plotly.purge('vcRandPlot'); return; }

  let aA=0, aV=0, aD=0;
  for (let i=0;i<data.length-1;i++) {
    const f1=data[i].f, w1=data[i].p, f2=data[i+1].f, w2=data[i+1].p;
    if (f1<=0||w1<=0||f2<=f1||w2<=0) continue;
    const m = Math.log(w2/w1)/Math.log(f2/f1);
    if (Math.abs(m+1)<0.0001) aA+=w1*f1*Math.log(f2/f1); else aA+=(w2*f2-w1*f1)/(m+1);
    const w1m = vcRandUnit==='G' ? w1*Math.pow(VC_G,2) : w1;
    if (Math.abs(m-1)<0.0001) aV+=(w1m/f1)*Math.log(f2/f1); else aV+=(w1m*Math.pow(f1,-m)/(m-1))*(Math.pow(f2,m-1)-Math.pow(f1,m-1));
    if (Math.abs(m-3)<0.0001) aD+=(w1m/Math.pow(f1,3))*Math.log(f2/f1); else aD+=(w1m*Math.pow(f1,-m)/(m-3))*(Math.pow(f2,m-3)-Math.pow(f1,m-3));
  }
  const grms = Math.sqrt(Math.max(0,aA));
  const vrms = Math.sqrt(Math.max(0,aV/(4*Math.PI**2)));
  const drms = Math.sqrt(Math.max(0,aD/(16*Math.PI**4)));
  document.getElementById('vcGrms').innerHTML  = grms.toFixed(3) + `<span class="vib-metric-unit">${vcRandUnit==='ms2'?'m/s²':'g'}</span>`;
  document.getElementById('vcPeak').innerHTML  = (3*grms).toFixed(3) + `<span class="vib-metric-unit">${vcRandUnit==='ms2'?'m/s²':'G'}</span>`;
  document.getElementById('vcVpeak').innerHTML = (3*vrms).toFixed(3) + '<span class="vib-metric-unit">m/s</span>';
  document.getElementById('vcDisp').innerHTML  = (6*drms*1000).toFixed(3) + '<span class="vib-metric-unit">mm</span>';

  if (!window.Plotly) return;
  const trace = {x:data.map(d=>d.f), y:data.map(d=>d.p), mode:'lines+markers', type:'scatter',
    line:{color:'#00d284',width:3}, marker:{size:7,color:'#fff',line:{color:'#00d284',width:2}},
    fill:'tozeroy', fillcolor:'rgba(0,210,132,0.05)'};
  const yTitle = vcRandUnit==='ms2'?'(m/s²)²/Hz':'g²/Hz';
  const layout = {
    margin:{l:60,r:15,t:15,b:45}, paper_bgcolor:'rgba(13,20,71,0)', plot_bgcolor:'rgba(13,20,71,0)',
    xaxis:{title:'Frequency (Hz)',type:'log',gridcolor:'rgba(99,179,237,.1)',tickfont:{color:'#94a3b8'},titlefont:{color:'#94a3b8',size:11}},
    yaxis:{title:`PSD (${yTitle})`,type:'log',gridcolor:'rgba(99,179,237,.1)',tickfont:{color:'#94a3b8'},titlefont:{color:'#94a3b8',size:11}},
    showlegend:false
  };
  Plotly.newPlot('vcRandPlot', [trace], layout, {displayModeBar:false, responsive:true});
}

export function vcInit() {
  if (document.getElementById('vcRandTbody').children.length === 0) {
    vcAddRandRow(20,0.0025,true); vcAddRandRow(80,0.01); vcAddRandRow(500,0.0017);
    vcRecalcSlopes();
  }
  if (document.getElementById('vcSineTbody').children.length === 0) {
    vcAddSineRow(10,'',1.0); vcAddSineRow(100,1.0,'');
    vcUpdateSineChart();
  }
}
