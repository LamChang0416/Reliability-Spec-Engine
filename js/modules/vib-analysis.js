import { convertUnit } from '../core/state.js';

// ─── VIBRATION ANALYSIS ENGINE ─────────────────────────────────────────────
const VC_G = 9.80665;

// Embedded PSD breakpoint library (Hz, g²/Hz) for known standard profiles
const VIB_PSD_PROFILES = {
  'cat 4':               [{f:10,p:0.015},{f:40,p:0.015},{f:500,p:0.00015}],
  'cat 20':              [{f:5,p:0.006},{f:5,p:0.006},{f:100,p:0.006},{f:500,p:0.002}],
  'ground vehicle':      [{f:5,p:0.006},{f:100,p:0.006},{f:500,p:0.002}],
  'cat24':               [{f:20,p:0.04},{f:1000,p:0.04},{f:2000,p:0.01}],
  'cat 24':              [{f:20,p:0.04},{f:1000,p:0.04},{f:2000,p:0.01}],
  'minimal integrity':   [{f:20,p:0.04},{f:1000,p:0.04},{f:2000,p:0.01}],
  'general minimal':     [{f:20,p:0.04},{f:1000,p:0.04},{f:2000,p:0.01}],
  'transportation':      [{f:5,p:0.001},{f:20,p:0.01},{f:500,p:0.01}],
  'gr-63 trans':         [{f:5,p:0.001},{f:20,p:0.01},{f:500,p:0.01}],
  'ista 3a':             [{f:1,p:0.0001},{f:4,p:0.01},{f:16,p:0.01},{f:40,p:0.001},{f:80,p:0.001},{f:200,p:0.00001}],
  '3a':                  [{f:1,p:0.0001},{f:4,p:0.01},{f:16,p:0.01},{f:40,p:0.001},{f:80,p:0.001},{f:200,p:0.00001}],
  'amazon':              [{f:1,p:0.0001},{f:4,p:0.01},{f:16,p:0.01},{f:40,p:0.001},{f:80,p:0.001},{f:200,p:0.00001}],
  '6-amazon':            [{f:1,p:0.0001},{f:4,p:0.01},{f:16,p:0.01},{f:40,p:0.001},{f:80,p:0.001},{f:200,p:0.00001}],
  'schedule a':          [{f:3,p:0.0007},{f:12,p:0.00785},{f:20,p:0.00785},{f:50,p:0.0008},{f:100,p:0.0008},{f:200,p:0.0002}],
  'schedule b':          [{f:3,p:0.0003},{f:6,p:0.003},{f:15,p:0.003},{f:40,p:0.0004},{f:80,p:0.0004},{f:200,p:0.0001}],
};

export function calcGrmsFromPSD(pts) {
  let area = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const f1=pts[i].f, w1=pts[i].p, f2=pts[i+1].f, w2=pts[i+1].p;
    if (f1<=0||w1<=0||f2<=f1||w2<=0) continue;
    const m = Math.log(w2/w1) / Math.log(f2/f1);
    if (Math.abs(m+1) < 0.0001) { area += w1*f1*Math.log(f2/f1); }
    else { area += (w2*f2 - w1*f1) / (m+1); }
  }
  return Math.sqrt(Math.max(0, area));
}

function findPSDProfile(specLabel) {
  const lbl = specLabel.toLowerCase().replace(/category\s*/g, 'cat ');
  for (const [key, pts] of Object.entries(VIB_PSD_PROFILES)) {
    if (lbl.includes(key)) return pts;
  }
  return null;
}

export function renderVibAnalysis(params, tests, specLabel) {
  const wrap = document.getElementById('chartWrap');
  if (!wrap) return;

  const psdPts = findPSDProfile(specLabel);

  let dynamicPsd = null;
  if (!psdPts && tests && tests.length > 1) {
    const keys = Object.keys(tests[0]||{});
    const fKey = keys.find(k => k.toLowerCase().includes('freq') || k.toLowerCase().includes('hz'));
    const pKey = keys.find(k => k.toLowerCase().includes('g²/hz') || k.toLowerCase().includes('psd') || k.toLowerCase().includes('level'));
    if (fKey && pKey) {
      const parsed = tests.map(row => ({ f: parseFloat(row[fKey]), p: parseFloat(row[pKey]) })).filter(d => !isNaN(d.f) && !isNaN(d.p));
      if (parsed.length > 1) dynamicPsd = parsed.sort((a,b) => a.f - b.f);
    }
  }
  const finalPsdPts = psdPts || dynamicPsd;

  const rawGrms = params['g rms'] || params['Grms'] || params['grms'] || '';
  let storedGrms = parseFloat(String(rawGrms).replace(/[^\d.]/g, '')) || null;
  const isVaries = String(rawGrms).includes('-') || String(rawGrms).toLowerCase().includes('varies');
  if (isVaries) storedGrms = rawGrms;

  const computedGrms = finalPsdPts ? calcGrmsFromPSD(finalPsdPts) : null;
  const grms = computedGrms || (typeof storedGrms === 'number' ? storedGrms : null);
  const isVibLabel = specLabel.toLowerCase().includes('vib') || specLabel.toLowerCase().includes('shock');
  if (!grms && !finalPsdPts && !storedGrms && !isVibLabel) return;

  const mathGrms = grms || parseFloat(String(storedGrms).match(/[\d.]+/)) || 0;
  const G_CONST = 9.80665;
  const peakG   = mathGrms ? (3 * mathGrms).toFixed(2) : '--';
  const peakV   = mathGrms ? (3 * mathGrms * G_CONST / (2 * Math.PI * 50)).toFixed(3) : '--';
  const grmsDisp = mathGrms ? (mathGrms * 9.80665 / (2 * Math.PI * 50)**2 * 1000 * 6).toFixed(2) : '--';
  const displayGrms = grms ? grms.toFixed(3) : (storedGrms || '--');
  const unitSuffix = isVaries && !grms ? '' : '<span class="vib-metric-unit">g</span>';

  const existingPlot = document.getElementById('psdPlotDiv');
  if (existingPlot && window.Plotly) {
    try { Plotly.purge(existingPlot); } catch(e){}
  }

  wrap.style.display = 'block';
  wrap.innerHTML = `
    <div class="vib-panel">
      <div class="vib-panel-title">〰️ Vibration Profile Analysis (Auto-Feed)</div>
      <div class="vib-metrics">
        <div class="vib-metric"><div class="vib-metric-label">Grms (RMS Accel)</div><div class="vib-metric-value" style="${isVaries?'font-size:16px':''}">${displayGrms}${unitSuffix}</div></div>
        <div class="vib-metric"><div class="vib-metric-label">預估測試量值 (3σ)</div><div class="vib-metric-value">${peakG}<span class="vib-metric-unit">g</span></div></div>
        <div class="vib-metric"><div class="vib-metric-label">Peak Velocity ≈</div><div class="vib-metric-value">${peakV}<span class="vib-metric-unit">m/s</span></div></div>
        <div class="vib-metric"><div class="vib-metric-label">P-P Disp ≈</div><div class="vib-metric-value">${grmsDisp}<span class="vib-metric-unit">mm</span></div></div>
      </div>
      ${finalPsdPts ? '<div id="psdPlotDiv" class="psd-plot"></div>' : '<div style="color:#64748b;font-size:11px;padding:4px 0">No PSD Profile available.</div>'}
    </div>`;

  if (finalPsdPts && window.Plotly) {
    const safePsdPts = finalPsdPts.map(d => ({ f: Math.max(d.f, 0.1), p: Math.max(d.p, 1e-10) }));
    const trace = {
      x: safePsdPts.map(d=>d.f), y: safePsdPts.map(d=>d.p),
      mode:'lines+markers', type:'scatter',
      line:{color:'#00d284',width:3,shape:'linear'},
      marker:{size:7,color:'#ffffff',line:{color:'#00d284',width:2}},
      fill:'tozeroy', fillcolor:'rgba(0,210,132,0.05)',
      hovertemplate: '%{x:.2f} Hz<br>%{y:.5f} g²/Hz<extra></extra>'
    };
    const layout = {
      margin:{l:55,r:15,t:15,b:45}, paper_bgcolor:'rgba(13,20,71,0)', plot_bgcolor:'rgba(13,20,71,0)',
      xaxis:{title:'Frequency (Hz)',type:'log',gridcolor:'rgba(99,179,237,.1)',tickfont:{color:'#94a3b8'},titlefont:{color:'#94a3b8',size:11}},
      yaxis:{title:'PSD (g²/Hz)',type:'log',gridcolor:'rgba(99,179,237,.1)',tickfont:{color:'#94a3b8'},titlefont:{color:'#94a3b8',size:11}},
      showlegend:false
    };
    Plotly.newPlot('psdPlotDiv', [trace], layout, {displayModeBar:false, responsive:true});
  }
}

let activeChart = null;
export function renderChart(tests) {
  const wrap = document.getElementById('chartWrap');
  if (!wrap || !tests || !tests.length || !window.Chart) return;
  const cols = Object.keys(tests[0]||{});
  if (cols.length < 2) return;
  const xCol = cols[0];
  const yCols = cols.slice(1).filter(c => !c.toLowerCase().includes('remark') && !c.toLowerCase().includes('note'));

  if (yCols.length > 0) {
    wrap.style.display = 'block';
    let labels = tests.map((row, i) => String(row[xCol] || (i+1)));
    const colors = [
      { border:'#68d391',bg:'rgba(104,211,145,0.1)',pt:'#63b3ed'},
      { border:'#f6ad55',bg:'rgba(246,173,85,0.1)',pt:'#ed8936'},
      { border:'#fc8181',bg:'rgba(252,129,129,0.1)',pt:'#f56565'},
      { border:'#63b3ed',bg:'rgba(99,179,237,0.1)',pt:'#4299e1'}
    ];
    let datasets = yCols.map((yCol, i) => {
      let dataPts = tests.map(row => { let val=parseFloat(convertUnit(String(row[yCol]||''))); return isNaN(val)?null:val; });
      let color = colors[i % colors.length];
      return { label:convertUnit(yCol), data:dataPts, borderColor:color.border, backgroundColor:color.bg, borderWidth:2, pointBackgroundColor:color.pt, pointBorderColor:'#0a0f2c', pointRadius:4, fill:i===0, tension:0.2, spanGaps:true };
    });
    if (activeChart) activeChart.destroy();
    const ctx = document.getElementById('profileChart').getContext('2d');
    activeChart = new Chart(ctx, {
      type:'line', data:{labels,datasets},
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:datasets.length>1,labels:{color:'#e2e8f0',font:{family:'Inter'}}}, title:{display:true,text:'Test Profile Visualization',color:'#90cdf4',font:{size:13,family:'Inter'}} },
        scales:{ x:{grid:{color:'rgba(99,179,237,0.1)'},title:{display:true,text:xCol,color:'#94a3b8',font:{size:11}},ticks:{color:'#e2e8f0'}}, y:{grid:{color:'rgba(99,179,237,0.1)'},ticks:{color:'#e2e8f0'}} }
      }
    });
  }
}
