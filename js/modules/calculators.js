import { LANG } from '../core/state.js';

// ─── Interactive Calculators ──────────────────────────────────────────────
export function getCalcHTML(v2, v3) {
  if (v3.includes('抗壓') || v3.includes('Compression') || v2.includes('Compression')) {
    const isZH = LANG === 'ZH';
    return `
      <div style="margin-top:20px; padding:16px; background:linear-gradient(135deg,rgba(0,210,132,.1),rgba(13,20,71,.5)); border:1px solid #00d284; border-radius:10px;">
        <h4 style="color:#00d284; margin-bottom:12px; font-size:14px;">🧮 ${isZH ? '互動式抗壓機測試計算 (L = W × ((H-h)/h) × F)' : 'Interactive Compression Calculator (L = W × ((H-h)/h) × F)'}</h4>
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
          <div>
            <label style="display:block; color:var(--muted); font-size:11px; margin-bottom:4px;">${isZH ? '單箱重 W (kg)' : 'Weight W (kg)'}</label>
            <input type="number" id="calcW" value="10" oninput="window._runCompressionCalc()" style="width:100px; padding:6px; border-radius:6px; border:1px solid var(--blue); background:rgba(13,27,62,.9); color:white;">
          </div>
          <div>
            <label style="display:block; color:var(--muted); font-size:11px; margin-bottom:4px;">${isZH ? '總疊高 H (mm)' : 'Total Height H'}</label>
            <input type="number" id="calcH" value="2000" oninput="window._runCompressionCalc()" style="width:100px; padding:6px; border-radius:6px; border:1px solid var(--blue); background:rgba(13,27,62,.9); color:white;">
          </div>
          <div>
            <label style="display:block; color:var(--muted); font-size:11px; margin-bottom:4px;">${isZH ? '單箱高 h (mm)' : 'Box Height h'}</label>
            <input type="number" id="calch" value="400" oninput="window._runCompressionCalc()" style="width:100px; padding:6px; border-radius:6px; border:1px solid var(--blue); background:rgba(13,27,62,.9); color:white;">
          </div>
          <div>
            <label style="display:block; color:var(--muted); font-size:11px; margin-bottom:4px;">${isZH ? '安全係數 F' : 'Safety Factor F'}</label>
            <input type="number" id="calcF" value="4.5" oninput="window._runCompressionCalc()" style="width:80px; padding:6px; border-radius:6px; border:1px solid var(--blue); background:rgba(13,27,62,.9); color:white;">
          </div>
          <div style="margin-left:auto; text-align:right;">
            <div style="color:var(--muted); font-size:11px; margin-bottom:4px;">${isZH ? '機台設定下壓力 Load (kgf)' : 'Target Load (kgf)'}</div>
            <div id="calcResult" style="color:#00d284; font-size:24px; font-weight:700;">180</div>
          </div>
        </div>
      </div>`;
  }
  return '';
}

export function runCompressionCalc() {
  const W = parseFloat(document.getElementById('calcW')?.value) || 0;
  const H = parseFloat(document.getElementById('calcH')?.value) || 0;
  const h = parseFloat(document.getElementById('calch')?.value) || 0;
  const F = parseFloat(document.getElementById('calcF')?.value) || 0;
  const el = document.getElementById('calcResult');
  if (!el) return;
  if (h === 0) { el.textContent = 'Error'; return; }
  let res = W * ((H - h) / h) * F;
  if (res < 0) res = 0;
  el.textContent = res.toFixed(1);
}
