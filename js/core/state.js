// ─── Global State ──────────────────────────────────────────────────────────
export let LANG = 'ZH';
export let CURRENT_UNIT = 'SI';

export const DBS = { iec: null, mil: null, astm: null, gr63: null, sr332: null, ista: null, iec60068: null, ip: null };

export const DB_FILES = {
  iec:      'iec_database.json',
  mil:      'mil810_database.json',
  astm:     'astm4169_database.json',
  gr63:     'gr63_database.json',
  sr332:    'sr332_database.json',
  ista:     'ista_database.json',
  iec60068: 'iec60068_database.json',
  ip:       'ip_code_database.json'
};

export const SKIP_KEYS = new Set(['Standard','Description_ZH','Description_EN','Description','_meta']);

export const STD_LABELS = {
  iec:      '🛡️ IEC 60721-3',
  mil:      '🎖️ MIL-STD-810H',
  astm:     '📦 ASTM D4169-22',
  gr63:     '🏢 GR-63 Issue 5',
  sr332:    '📈 Telcordia SR-332',
  ista:     '📦 ISTA',
  iec60068: '🔬 IEC 60068',
  ip:       '💧 IP Code (IEC)'
};

export const ALL_STD_KEYS = ['iec','mil','astm','gr63','sr332','ista','iec60068','ip'];

// IEC 60721-3 location class descriptions
export const IEC_CLASS_ZH = {
  '1':'1 — 儲存環境 Storage',
  '2':'2 — 運輸環境 Transportation',
  '3':'3 — 室內定點使用 Stationary Indoor',
  '4':'4 — 戶外定點使用 Stationary Outdoor',
  '5':'5 — 地面車輛環境 Ground Vehicle',
  '6':'6 — 船舶環境 Ship / Marine',
  '7':'7 — 攜帶式與行動設備 Portable / Non-stationary',
  '9':'9 — 產品內部微氣候 Microclimates Inside Products'
};
export const IEC_CLASS_EN = {
  '1':'1 — Storage',
  '2':'2 — Transportation',
  '3':'3 — Stationary Indoor Use',
  '4':'4 — Stationary Outdoor Use',
  '5':'5 — Ground Vehicle',
  '6':'6 — Ship / Marine',
  '7':'7 — Portable / Non-stationary',
  '9':'9 — Microclimates Inside Products'
};

// ─── Lang ─────────────────────────────────────────────────────────────────
export function setLang(l, deps = {}) {
  LANG = l;
  document.getElementById('btnZH').classList.toggle('active', l==='ZH');
  document.getElementById('btnEN').classList.toggle('active', l==='EN');
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.textContent = l==='ZH' ? el.dataset.zh : el.dataset.en;
  });
  document.getElementById('searchInput').placeholder = l==='ZH' ? '搜尋規範關鍵字...' : 'Search specs...';
  // Re-render active results
  ALL_STD_KEYS.forEach(s => {
    const l3 = document.getElementById(s+'-l3');
    if (l3 && l3.value && deps.showResult) deps.showResult(s);
    else {
      const el = document.querySelector(`#${s}-result .empty`);
      if (el) el.textContent = el.dataset[l.toLowerCase()];
    }
  });
  if (deps.renderDashboard) deps.renderDashboard();
}

// ─── Unit ─────────────────────────────────────────────────────────────────
export function setUnit(u, deps = {}) {
  CURRENT_UNIT = u;
  document.getElementById('btnSI').classList.toggle('active', u==='SI');
  document.getElementById('btnIMP').classList.toggle('active', u==='IMP');
  ALL_STD_KEYS.forEach(s => {
    const l3 = document.getElementById(s+'-l3');
    if (l3 && l3.value && deps.showResult) deps.showResult(s);
  });
}

export function convertUnit(v) {
  if (typeof v !== 'string' || CURRENT_UNIT === 'SI') return v;
  let out = v.replace(/(-?\d+(?:\.\d+)?)\s*°C/g, (m, p1) => Math.round((parseFloat(p1) * 9/5) + 32) + ' °F');
  out = out.replace(/(\d+(?:\.\d+)?)\s*mm/g, (m, p1) => (parseFloat(p1) / 25.4).toFixed(2) + ' inch');
  out = out.replace(/(\d+(?:\.\d+)?)\s*kg(?!\/)/g, (m, p1) => (parseFloat(p1) * 2.20462).toFixed(2) + ' lbs');
  return out;
}
