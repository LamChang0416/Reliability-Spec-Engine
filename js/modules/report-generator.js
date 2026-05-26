import { LANG, DBS, STD_LABELS } from '../core/state.js';
import { getAllPhotos } from './photo-processor.js';

// ─── Report Generator ────────────────────────────────────────────────────
let reportItems = [];
export let reportSchedules = [];

export function addToReport(std, v1, v2, v3) {
  const id = `${std}|${v1}|${v2}|${v3}`;
  if (reportItems.find(r => r.id === id)) {
    alert(LANG==='ZH' ? '此規範已在報告中' : 'This spec is already in the report');
    return;
  }
  const entry = DBS[std]?.[v1]?.[v2]?.[v3];
  if (!entry) return;
  reportItems.push({ id, std, v1, v2, v3, entry });
  updateReportBadge();
  const msg = LANG==='ZH' ? `✅ 已加入報告 (${reportItems.length} 項)` : `✅ Added to report (${reportItems.length} items)`;
  const badge = document.createElement('div');
  badge.textContent = msg;
  badge.style.cssText = 'position:fixed;top:80px;right:20px;background:#00d284;color:#0a0f2c;padding:8px 16px;border-radius:8px;font-weight:bold;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
  document.body.appendChild(badge);
  setTimeout(()=>badge.remove(), 2000);
}

function updateReportBadge() {
  const badge = document.getElementById('reportBadge');
  if (badge) badge.textContent = reportItems.length || '';
}

export function initReportPanel() {
  refreshReportList();
}

function refreshReportList() {
  const list = document.getElementById('reportItemList');
  if (!list) return;
  if (reportItems.length === 0) {
    list.innerHTML = `<div class="empty">${LANG==='ZH'?'尚未加入任何規範，請在查詢結果中點擊「📄 加入報告」':'No specs added. Click "📄 Add to Report" from query results.'}</div>`;
    return;
  }
  list.innerHTML = reportItems.map((r, i) => `
    <div class="sr-card" style="position:relative;">
      <button onclick="window._removeReportItem(${i})" style="position:absolute;right:8px;top:8px;background:transparent;border:none;color:#fc8181;cursor:pointer;font-size:14px;">✕</button>
      <div class="sr-std">${STD_LABELS[r.std]}</div>
      <div class="sr-path">🎯 ${r.v3}</div>
      <div class="sr-desc" style="font-size:11px;color:var(--muted);">${r.v1} › ${r.v2}</div>
    </div>
  `).join('');
}

window._removeReportItem = function(idx) {
  reportItems.splice(idx, 1);
  updateReportBadge();
  refreshReportList();
};

// ── Generate HTML Report ──
export async function generateHTMLReport() {
  const title = document.getElementById('reportTitle')?.value || 'Reliability Test Report';
  const testNo = document.getElementById('reportTestNo')?.value || '';
  const engineer = document.getElementById('reportEngineer')?.value || 'Lam';
  const includePhotos = document.getElementById('reportIncludePhotos')?.checked ?? true;
  const now = new Date().toLocaleString('zh-TW');

  let photosHTML = '';
  if (includePhotos) {
    try {
      const photos = await getAllPhotos();
      if (photos.length) {
        const photoCards = await Promise.all(photos.map(async p => {
          const base64 = await blobToBase64(p.blob);
          return `<div style="display:inline-block;margin:8px;text-align:center;">
            <img src="${base64}" style="max-width:400px;max-height:300px;border:1px solid #ddd;border-radius:4px;">
            <div style="font-size:11px;color:#666;margin-top:4px;">${p.metadata?.name || ''} | ${p.metadata?.watermark || ''}</div>
          </div>`;
        }));
        photosHTML = `<div class="report-section"><h2>📷 測試照片 / Test Photos</h2>${photoCards.join('')}</div>`;
      }
    } catch(e) { console.error(e); }
  }

  
  let schedulesHTML = '';
  if (reportSchedules && reportSchedules.length > 0) {
    const sRows = reportSchedules.map(s => `<tr>
      <td style="font-weight:600;color:#2d3748;">${s.name}</td>
      <td>${s.duration}</td>
      <td>${s.start}</td>
      <td style="color:#2b6cb0;font-weight:600;">${s.end}</td>
    </tr>`).join('');
    
    schedulesHTML = `<div class="report-section">
      <h2>⏱️ 測試排程計畫 / Test Schedule Plan</h2>
      <table class="test-table" style="width:100%;margin-top:10px;">
        <tr>
          <th>Test Item</th>
          <th>Duration</th>
          <th>Start Time</th>
          <th>Est. End Time</th>
        </tr>
        ${sRows}
      </table>
    </div>`;
  }

  const specsHTML = reportItems.map(r => {
    const params = r.entry.parameters || {};
    const tests = r.entry.tests || [];
    const desc = LANG==='ZH' ? (params.Description_ZH||params.Description||'') : (params.Description_EN||params.Description_ZH||'');
    
    const paramRows = Object.entries(params)
      .filter(([k]) => !['Standard','Description_ZH','Description_EN','Description','_meta'].includes(k))
      .map(([k,v]) => `<tr><td style="font-weight:600;color:#2d3748;width:40%;">${k}</td><td>${v}</td></tr>`)
      .join('');

    let testTable = '';
    if (tests.length) {
      const cols = Object.keys(tests[0]);
      testTable = `<table class="test-table">
        <tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>
        ${tests.map(row=>`<tr>${cols.map(c=>`<td>${row[c]??''}</td>`).join('')}</tr>`).join('')}
      </table>`;
    }

    return `<div class="report-section">
      <h2>${STD_LABELS[r.std]} — ${r.v3}</h2>
      <p style="color:#666;font-size:12px;">${r.v1} › ${r.v2}</p>
      <p style="margin:8px 0;">${desc}</p>
      <table class="param-table">${paramRows}</table>
      ${testTable}
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #1a202c; background: #fff; padding: 40px; max-width: 900px; margin: 0 auto; }
    .report-header { border-bottom: 3px solid #2b6cb0; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .report-header h1 { color: #2b6cb0; font-size: 24px; }
    .report-meta { font-size: 12px; color: #718096; text-align: right; line-height: 1.8; }
    .report-section { margin-bottom: 30px; page-break-inside: avoid; }
    .report-section h2 { color: #2b6cb0; font-size: 16px; border-left: 4px solid #2b6cb0; padding-left: 12px; margin-bottom: 12px; }
    .param-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .param-table td { padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
    .param-table tr:nth-child(even) { background: #f7fafc; }
    .test-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .test-table th { background: #2b6cb0; color: white; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
    .test-table td { padding: 7px 10px; border: 1px solid #e2e8f0; font-size: 12px; }
    .test-table tr:nth-child(even) { background: #f7fafc; }
    .report-footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 11px; color: #a0aec0; display: flex; justify-content: space-between; }
    @media print { body { padding: 20px; } .report-section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <h1>🛡️ ${title}</h1>
      <div style="color:#718096;font-size:13px;margin-top:4px;">Reliability Spec Engine — Auto-Generated Report</div>
    </div>
    <div class="report-meta">
      ${testNo ? `Test No: <b>${testNo}</b><br>` : ''}
      Engineer: <b>${engineer}</b><br>
      Date: <b>${now}</b><br>
      Items: <b>${reportItems.length}</b>
    </div>
  </div>
  ${schedulesHTML}
  ${specsHTML}
  ${photosHTML}
  <div class="report-footer">
    <span>Generated by Reliability Spec Engine 3.0 (by Lam)</span>
    <span>${now}</span>
  </div>
</body>
</html>`;

  return html;
}

// ── PDF via html2canvas + jsPDF ──
export async function generatePDFReport() {
  const html = await generateHTMLReport();
  // Open in new window for print/PDF
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 500);
}

// ── Download as HTML ──
export async function downloadHTMLReport() {
  const html = await generateHTMLReport();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Reliability_Report_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Utility
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Expose to window
window._addToReport = function(std, v1, v2, v3) { addToReport(std, v1, v2, v3); };
window._generatePDF = function() { generatePDFReport(); };
window._downloadHTML = function() { downloadHTMLReport(); };


export function addScheduleToReport(scheduleData) {
  reportSchedules.push(scheduleData);
  alert(LANG==='ZH' ? `✅ 已加入報告 (目前有 ${reportSchedules.length} 項時程計畫)` : `✅ Added to report (${reportSchedules.length} schedules)`);
}
