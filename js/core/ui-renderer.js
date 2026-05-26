import { DBS, LANG, SKIP_KEYS, convertUnit } from './state.js';
import { validateParams } from '../../api/validator.js';

// ─── Show Result (Core Renderer) ──────────────────────────────────────────
export function showResult(std, deps = {}) {
  const v1 = document.getElementById(std+'-l1').value;
  const v2 = document.getElementById(std+'-l2').value;
  const v3 = document.getElementById(std+'-l3').value;
  const box = document.getElementById(std+'-result');
  if (!v1||!v2||!v3) { box.innerHTML=`<div class="empty">${LANG==='ZH'?'← 請完成選擇':'← Complete selection'}</div>`; return; }
  const entry = DBS[std]?.[v1]?.[v2]?.[v3];
  if (!entry) { box.innerHTML='<div class="empty">No data</div>'; return; }
  const params = entry.parameters || {};
  const desc = LANG==='ZH' ? (params.Description_ZH||params.Description||'') : (params.Description_EN||params.Description_ZH||'');
  const tests = entry.tests || [];

  // Physical boundary validation
  const warnings = validateParams(std, params);
  const warningHTML = warnings.length ? `<div style="margin-bottom:10px;">${warnings.map(w =>
    `<div style="padding:8px 12px;margin-bottom:4px;border-radius:6px;font-size:12px;border-left:3px solid ${w.level==='error'?'#fc8181':'#f6ad55'};background:${w.level==='error'?'rgba(252,129,129,.1)':'rgba(246,173,85,.1)'};color:${w.level==='error'?'#fc8181':'#f6ad55'};">⚠️ ${w.msg}</div>`
  ).join('')}</div>` : '';

  // Metrics
  const metricHTML = Object.entries(params)
    .filter(([k])=>!SKIP_KEYS.has(k))
    .map(([k,v])=>`<div class="metric"><div class="metric-label">${k}</div><div class="metric-value">${convertUnit(v)}</div></div>`)
    .join('');

  // Table
  let tableHTML = '';
  if (tests.length) {
    const cols = Object.keys(tests[0]);
    tableHTML = `<div class="table-wrap"><table>
      <tr>${cols.map(c=>`<th>${convertUnit(c)}</th>`).join('')}</tr>
      ${tests.map(row=>`<tr>${cols.map(c=>`<td>${convertUnit(row[c]??'')}</td>`).join('')}</tr>`).join('')}
    </table></div>`;
  }

  // Store for download
  box._entry = entry;
  box._prefix = `${std.toUpperCase()}_${v3.replace(/[^a-zA-Z0-9]/g,'_').slice(0,20)}`;

  let chartWrap = `<div id="chartWrap" style="display:none; margin-bottom:14px; background:rgba(13,20,71,.5); border:1px solid rgba(99,179,237,.15); border-radius:10px; padding:20px; position:relative;"><canvas id="profileChart" style="max-height:220px;"></canvas></div>`;

  // Interactive Calculator injection
  let calcHTML = '';
  if (deps.getCalcHTML) {
    calcHTML = deps.getCalcHTML(v2, v3);
  }

  const sv1 = v1.replace(/'/g,"\\'").replace(/"/g,'&quot;');
  const sv2 = v2.replace(/'/g,"\\'").replace(/"/g,'&quot;');
  const sv3 = v3.replace(/'/g,"\\'").replace(/"/g,'&quot;');

  box.innerHTML = `
    <div class="result-banner">
      <h4>🎯 ${v3}</h4>
      <div class="result-desc">${desc}</div>
    </div>
    ${warningHTML}
    <div class="metrics">${metricHTML}</div>
    ${chartWrap}
    ${tableHTML}
    ${calcHTML}
    <div class="btn-row">
      <button class="btn btn-dl" onclick="window._togglePin('${std}', '${sv1}', '${sv2}', '${sv3}')">📌 Pin to Dashboard</button>
      <button class="btn btn-dl" onclick="window._dlJSON('${std}')">📥 JSON</button>
      ${tests.length?`<button class="btn btn-dl" onclick="window._dlCSV('${std}')">📥 CSV</button>`:''}
      <button class="btn btn-dl" onclick="window._addToReport('${std}', '${sv1}', '${sv2}', '${sv3}')">📄 加入報告</button>
    </div>`;

  // Route to vibration or thermal chart
  setTimeout(()=>{
    const cols = tests.length ? Object.keys(tests[0]) : [];
    const colsNorm = cols.map(c => c.replace(/\s/g,'').toLowerCase());
    const specName = (v1 + ' ' + v2 + ' ' + v3).toLowerCase();
    const isVib = specName.includes('vibration') || specName.includes('shock')
                  || colsNorm.some(c => /freq|hz|psd|grms|vibr|acceler/.test(c))
                  || Object.keys(params).some(k => k.replace(/\s/g,'').toLowerCase().includes('grms'))
                  || !!params['g rms'] || !!params['Grms'] || !!params['Profile'];
    if (isVib && deps.renderVibAnalysis) {
      deps.renderVibAnalysis(params, tests, v1 + ' ' + v3);
    }
  }, 50);
}

// ─── Download ──────────────────────────────────────────────────────────────
export function dlJSON(std) {
  const box = document.getElementById(std+'-result');
  if (!box._entry) return;
  const blob = new Blob([JSON.stringify(box._entry,null,2)],{type:'application/json'});
  triggerDl(blob, box._prefix+'.json');
}

export function dlCSV(std) {
  const box = document.getElementById(std+'-result');
  if (!box._entry?.tests?.length) return;
  const tests = box._entry.tests;
  const cols = Object.keys(tests[0]);
  const csv = [cols.join(','), ...tests.map(r=>cols.map(c=>'"'+(r[c]??'')+'"').join(','))].join('\n');
  triggerDl(new Blob(['\uFEFF'+csv],{type:'text/csv'}), box._prefix+'.csv');
}

function triggerDl(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── Tab ──────────────────────────────────────────────────────────────────
export function showTab(id, btn, deps = {}) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-'+id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (!DBS[id] && deps.loadDB) deps.loadDB(id);
}

export function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
