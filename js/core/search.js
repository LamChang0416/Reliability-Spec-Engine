import { DBS, LANG, STD_LABELS } from './state.js';

let fuseInstance = null;

export function doSearch(q) {
  const box = document.getElementById('searchResults');
  if (!q || q.length < 2) { box.innerHTML=''; return; }
  
  if (!fuseInstance) {
    let list = [];
    Object.entries(DBS).forEach(([std, db]) => {
      if (!db) return;
      Object.entries(db).forEach(([l1,l1v]) => {
        if (typeof l1v!=='object') return;
        Object.entries(l1v).forEach(([l2,l2v]) => {
          if (typeof l2v!=='object') return;
          Object.entries(l2v).forEach(([l3,entry]) => {
            if (typeof entry!=='object') return;
            const p = entry.parameters||{};
            const descZH = p.Description_ZH||p.Description||'';
            const descEN = p.Description_EN||p.Description_ZH||'';
            list.push({
              stdKey: std,
              stdLabel: STD_LABELS[std] || std,
              l1, l2, l3,
              descZH, descEN,
              path: `${l1} ▸ ${l2} ▸ ${l3}`,
              rawContent: JSON.stringify(entry)
            });
          });
        });
      });
    });
    
    fuseInstance = new Fuse(list, {
      keys: ['l1', 'l2', 'l3', 'descZH', 'descEN', 'rawContent', 'stdLabel'],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
  }

  const results = fuseInstance.search(q);

  if (!results.length) {
    box.innerHTML=`<div class="sr-card"><div class="sr-desc">${LANG==='ZH'?'🔍 找不到符合的結果':'No results found'}</div></div>`;
    return;
  }
  
  box.innerHTML = `<div class="sr-count">${LANG==='ZH'?`🔍 找到 <b>${results.length}</b> 條相關測試`:`🔍 Found <b>${results.length}</b> related tests`}</div>`
    + results.slice(0,30).map(r => {
        const item = r.item;
        const desc = LANG==='ZH' ? item.descZH : item.descEN;
        return `
      <div class="sr-card" style="cursor:pointer;" onclick="window._navigateToSpec('${item.stdKey}','${item.l1.replace(/'/g,"\\'")}','${item.l2.replace(/'/g,"\\'")}','${item.l3.replace(/'/g,"\\'")}')">
        <div class="sr-std">${item.stdLabel}</div>
        <div class="sr-path">📂 ${item.path}</div>
        <div class="sr-desc">${desc}</div>
      </div>`}).join('');
}

export function resetFuse() {
  fuseInstance = null;
}
