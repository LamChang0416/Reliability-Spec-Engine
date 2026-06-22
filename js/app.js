// ═══════════════════════════════════════════════════════════════════════════
// Reliability Spec Engine 3.0 — Main Entry Point (ES Module)
// ═══════════════════════════════════════════════════════════════════════════

import { setLang, setUnit, ALL_STD_KEYS } from './core/state.js';
import { loadDB, buildL2, buildL3 } from './core/db-loader.js';
import { showResult, dlJSON, dlCSV, showTab, toggleSidebar } from './core/ui-renderer.js';
import { doSearch, resetFuse } from './core/search.js';
import { initPWA } from './core/pwa.js';
import { renderVibAnalysis } from './modules/vib-analysis.js';
import { vcSwitchTab, vcAddSineRow, vcLoadSine, vcCalcSine, vcUpdateSineChart, vcUpdateSineTime,
         vcAddRandRow, vcLoadRandom, vcSetUnit, vcHandleRandInput, vcRecalcSlopes,
         vcCalcAndPlotRandom, vcInit } from './modules/vib-calculator.js';
import { getCalcHTML, runCompressionCalc } from './modules/calculators.js';
import { togglePin, renderDashboard, navigateToSpec } from './modules/dashboard.js';
import { initPhotoPanel } from './modules/photo-processor.js';
import { initReportPanel, addToReport } from './modules/report-generator.js';
import { calculateSchedule, startScheduleProgress, initScheduler, addScheduleToReportAction } from './modules/scheduler.js';
import { initRagEngine, askQuestion, saveApiKey, loadApiKey } from './modules/rag_engine.js';

// ─── 🛡️ Global Error Boundary (Cycle 7) ──────────────────────────────────
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error("Global Error Caught:", msg, url, lineNo, columnNo, error);
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#e53e3e;color:white;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-family:Inter,sans-serif;font-size:14px;';
  toast.innerHTML = '🚨 <b>System Error</b><br><span style="font-size:12px;opacity:0.9">' + msg + '</span>';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
  return false;
};
// ─── Wire showResult with dependencies ────────────────────────────────────
function showResultWired(std) {
  showResult(std, {
    renderVibAnalysis,
    getCalcHTML
  });
}

// ─── Expose to window for inline event handlers ──────────────────────────
// (HTML onclick attributes need global scope access)
window.toggleSidebar = toggleSidebar;
window._showResult = showResultWired;
window._showTab = (id, btn) => showTab(id, btn, { loadDB });
window._buildL2 = buildL2;
window._buildL3 = buildL3;
window._dlJSON = dlJSON;
window._dlCSV = dlCSV;
window._togglePin = togglePin;
window._navigateToSpec = navigateToSpec;
window._runCompressionCalc = runCompressionCalc;
window._addToReport = addToReport;


// Scheduler
window._calculateSchedule = calculateSchedule;
window._startScheduleProgress = startScheduleProgress;
window._addScheduleToReportAction = addScheduleToReportAction;

// Search
window._doSearch = doSearch;

// Lang / Unit
window._setLang = (l) => setLang(l, { showResult: showResultWired, renderDashboard: () => renderDashboard(showResultWired) });
window._setUnit = (u) => setUnit(u, { showResult: showResultWired });

// Vibration Calculator
window.vcSwitchTab = vcSwitchTab;
window.vcAddSineRow = vcAddSineRow;
window.vcLoadSine = vcLoadSine;
window.vcCalcSine = vcCalcSine;
window.vcUpdateSineChart = vcUpdateSineChart;
window.vcUpdateSineTime = vcUpdateSineTime;
window.vcAddRandRow = vcAddRandRow;
window.vcLoadRandom = vcLoadRandom;
window.vcSetUnit = vcSetUnit;
window.vcHandleRandInput = vcHandleRandInput;
window.vcRecalcSlopes = vcRecalcSlopes;
window.vcCalcAndPlotRandom = vcCalcAndPlotRandom;

// RAG Engine
window.ragInitEngine = initRagEngine;
window.ragAskQuestion = askQuestion;
window.ragSaveApiKey = saveApiKey;

// ─── Close sidebar when clicking outside on mobile ─────────────────────────
document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 850 && sidebar.classList.contains('open')) {
    if (!sidebar.contains(e.target) && !e.target.closest('.mobile-menu-btn')) {
      sidebar.classList.remove('open');
    }
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  setLang('ZH', { showResult: showResultWired, renderDashboard: () => renderDashboard(showResultWired) });
  ALL_STD_KEYS.forEach(loadDB);
  renderDashboard(showResultWired);
  initPhotoPanel();
  initReportPanel();
  initScheduler();
  loadApiKey();
});

initPWA();
