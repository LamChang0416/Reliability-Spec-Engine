import { DBS, DB_FILES, LANG, IEC_CLASS_ZH, IEC_CLASS_EN } from './state.js';

// ─── Load DB ───────────────────────────────────────────────────────────────
export async function loadDB(std) {
  try {
    const r = await fetch(DB_FILES[std]);
    const data = await r.json();
    // Strip _meta from the data so it doesn't appear as a selectable option
    if (data._meta) {
      DBS[std] = {};
      Object.entries(data).forEach(([k, v]) => {
        if (k !== '_meta') DBS[std][k] = v;
      });
      // Store meta separately for version display
      if (!window._dbMeta) window._dbMeta = {};
      window._dbMeta[std] = data._meta;
    } else {
      DBS[std] = data;
    }
    buildL1(std);
  } catch(e) {
    console.error('Failed to load', DB_FILES[std], e);
  }
}

// ─── Selector Builders ────────────────────────────────────────────────────
export function buildL1(std) {
  const sel = document.getElementById(std+'-l1');
  sel.innerHTML = '<option value="">-- Select --</option>';
  Object.keys(DBS[std]).forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    if (std === 'iec') {
      o.textContent = (LANG==='ZH' ? IEC_CLASS_ZH[k] : IEC_CLASS_EN[k]) || k;
    } else {
      o.textContent = k;
    }
    sel.appendChild(o);
  });
}

export function buildL2(std) {
  const v1 = document.getElementById(std+'-l1').value;
  const sel = document.getElementById(std+'-l2');
  const sel3 = document.getElementById(std+'-l3');
  sel.innerHTML = '<option value="">-- Select --</option>';
  sel3.innerHTML = '<option value="">-- Select --</option>';
  sel.disabled = !v1; sel3.disabled = true;
  document.getElementById(std+'-result').innerHTML = `<div class="empty">${LANG==='ZH'?'← 請繼續選擇':'← Continue selection'}</div>`;
  if (!v1 || !DBS[std][v1]) return;
  Object.keys(DBS[std][v1]).forEach(k => {
    const o = document.createElement('option');
    o.value = k; o.textContent = k;
    sel.appendChild(o);
  });
}

export function buildL3(std) {
  const v1 = document.getElementById(std+'-l1').value;
  const v2 = document.getElementById(std+'-l2').value;
  const sel = document.getElementById(std+'-l3');
  sel.innerHTML = '<option value="">-- Select --</option>';
  sel.disabled = !v2;
  document.getElementById(std+'-result').innerHTML = `<div class="empty">${LANG==='ZH'?'← 請繼續選擇':'← Continue selection'}</div>`;
  if (!v2 || !DBS[std][v1][v2]) return;
  Object.keys(DBS[std][v1][v2]).forEach(k => {
    const o = document.createElement('option');
    o.value = k; o.textContent = k;
    sel.appendChild(o);
  });
}
