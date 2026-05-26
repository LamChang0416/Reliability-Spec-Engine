import { DBS, LANG, STD_LABELS } from '../core/state.js';
import { loadDB } from '../core/db-loader.js';
import { buildL2, buildL3 } from '../core/db-loader.js';
import { showTab, showResult } from '../core/ui-renderer.js';

// ─── Pinned Specs (Dashboard) ──────────────────────────────────────────────
let pinnedSpecs = JSON.parse(localStorage.getItem('specEnginePins') || '[]');

export function togglePin(std, v1, v2, v3) {
  const id = `${std}|${v1}|${v2}|${v3}`;
  const idx = pinnedSpecs.findIndex(p => p.id === id);
  if (idx > -1) {
    pinnedSpecs.splice(idx, 1);
  } else {
    pinnedSpecs.push({ id, std, v1, v2, v3 });
  }
  localStorage.setItem('specEnginePins', JSON.stringify(pinnedSpecs));
  renderDashboard();
  
  const msg = LANG === 'ZH' ? '釘選狀態已更新！' : 'Pin status updated!';
  const badge = document.createElement('div');
  badge.textContent = msg;
  badge.style.cssText = 'position:fixed;top:80px;right:20px;background:var(--green);color:var(--bg);padding:8px 16px;border-radius:8px;font-weight:bold;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
  document.body.appendChild(badge);
  setTimeout(()=>badge.remove(), 2000);
}

export function renderDashboard(showResultFn) {
  const grid = document.getElementById('pinGrid');
  if (!grid) return;
  if (pinnedSpecs.length === 0) {
    grid.innerHTML = `<div class="empty" id="emptyPin">${LANG==='ZH'?'目前沒有釘選的規範。':'No pinned specs yet.'}</div>`;
    return;
  }
  
  grid.innerHTML = pinnedSpecs.map(p => {
    let desc = '';
    if (DBS[p.std] && DBS[p.std][p.v1] && DBS[p.std][p.v1][p.v2] && DBS[p.std][p.v1][p.v2][p.v3]) {
      const params = DBS[p.std][p.v1][p.v2][p.v3].parameters || {};
      desc = LANG==='ZH' ? (params.Description_ZH||params.Description||'') : (params.Description_EN||params.Description_ZH||'');
    }
    const sv1 = p.v1.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    const sv2 = p.v2.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    const sv3 = p.v3.replace(/'/g,"\\'").replace(/"/g,'&quot;');
    return `
      <div class="sr-card" style="cursor:pointer; position:relative; min-height:120px;" onclick="window._navigateToSpec('${p.std}','${sv1}','${sv2}','${sv3}')">
        <button style="position:absolute; right:12px; top:12px; background:transparent; border:none; color:rgba(255,255,255,0.4); cursor:pointer; font-size:14px;" onmouseover="this.style.color='#f56565'" onmouseout="this.style.color='rgba(255,255,255,0.4)'" onclick="event.stopPropagation(); window._togglePin('${p.std}','${sv1}','${sv2}','${sv3}')">✖</button>
        <div class="sr-std">${STD_LABELS[p.std] || p.std}</div>
        <div class="sr-path" style="font-size:14px; margin:8px 0; color:var(--blue2);">🎯 ${p.v3}</div>
        <div class="sr-path" style="font-size:10px; color:var(--muted); margin-bottom:8px;">📌 ${p.v1} › ${p.v2}</div>
        <div class="sr-desc" style="display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-size:11px; color:#a0aec0;">${desc}</div>
      </div>`;
  }).join('');
}

export async function navigateToSpec(std, v1, v2, v3) {
  if (!DBS[std]) await loadDB(std);
  showTab(std, document.getElementById('tab' + std.toUpperCase()), { loadDB });
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  setTimeout(() => {
    const sl1 = document.getElementById(std+'-l1');
    if(sl1) { sl1.value = v1; buildL2(std); }
    const sl2 = document.getElementById(std+'-l2');
    if(sl2) { sl2.value = v2; buildL3(std); }
    const sl3 = document.getElementById(std+'-l3');
    if(sl3) { sl3.value = v3; window._showResult(std); }
  }, 100);
}
