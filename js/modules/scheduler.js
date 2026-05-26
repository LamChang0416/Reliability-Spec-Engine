import { LANG } from '../core/state.js';
import { addScheduleToReport } from './report-generator.js';

let progressInterval = null;
let currentStart = null;
let currentEnd = null;

// ─── Format Duration ────────────────────────────────────────────────────────
function formatDuration(totalMinutes) {
  const days = Math.floor(totalMinutes / (24 * 60));
  const hrs = Math.floor((totalMinutes % (24 * 60)) / 60);
  const mins = totalMinutes % 60;
  
  let result = [];
  if (days > 0) result.push(`${days} ${LANG === 'ZH' ? '天' : 'days'}`);
  if (hrs > 0) result.push(`${hrs} ${LANG === 'ZH' ? '小時' : 'hrs'}`);
  if (mins > 0 || result.length === 0) result.push(`${mins} ${LANG === 'ZH' ? '分鐘' : 'mins'}`);
  return result.join(' ');
}

// ─── Calculate End Time ─────────────────────────────────────────────────────
export function calculateSchedule() {
  const durationInput = document.getElementById('schedDuration');
  const startInput = document.getElementById('schedStartTime');
  const endDisplay = document.getElementById('schedEndTime');
  const durationDisplay = document.getElementById('schedDurationDisplay');
  
  if (!durationInput || !startInput || !endDisplay || !durationDisplay) return;

  const durationMinutes = parseInt(durationInput.value) || 0;
  if (durationMinutes <= 0) {
    endDisplay.textContent = '--';
    durationDisplay.textContent = '--';
    return;
  }

  // Parse start time
  let startDate = new Date(startInput.value);
  if (isNaN(startDate.getTime())) {
    startDate = new Date(); // fallback to now
    startInput.value = getLocalISOString(startDate).slice(0, 16);
  }

  // Calculate end time
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  currentStart = startDate;
  currentEnd = endDate;

  // Update Display
  endDisplay.textContent = endDate.toLocaleString(LANG === 'ZH' ? 'zh-TW' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  });
  durationDisplay.textContent = formatDuration(durationMinutes);
  
  // Refresh progress if it's currently running
  updateProgressBar();
}

// ─── Progress Bar Logic ─────────────────────────────────────────────────────
function updateProgressBar() {
  const bar = document.getElementById('schedProgressBar');
  const pctText = document.getElementById('schedProgressPct');
  if (!bar || !pctText || !currentStart || !currentEnd) return;

  const now = new Date();
  const totalMs = currentEnd.getTime() - currentStart.getTime();
  const elapsedMs = now.getTime() - currentStart.getTime();

  let pct = 0;
  if (totalMs > 0) {
    pct = (elapsedMs / totalMs) * 100;
  }
  
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;

  bar.style.width = `${pct}%`;
  pctText.textContent = `${pct.toFixed(1)}%`;
  
  if (pct >= 100 && progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

export function startScheduleProgress() {
  calculateSchedule(); // ensure recalculation
  if (progressInterval) clearInterval(progressInterval);
  updateProgressBar();
  progressInterval = setInterval(updateProgressBar, 1000);
}

export function stopScheduleProgress() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// ─── Add to Report ──────────────────────────────────────────────────────────
export function addScheduleToReportAction() {
  const testName = document.getElementById('schedTestName')?.value || 'Custom Test';
  const durationInput = document.getElementById('schedDuration');
  const durationMinutes = parseInt(durationInput?.value) || 0;
  
  if (!currentStart || !currentEnd || durationMinutes <= 0) {
    alert(LANG === 'ZH' ? '請先填寫正確的時長與開始時間' : 'Please fill in valid duration and start time');
    return;
  }

  addScheduleToReport({
    name: testName,
    duration: formatDuration(durationMinutes),
    start: currentStart.toLocaleString('zh-TW', { hour12: false }),
    end: currentEnd.toLocaleString('zh-TW', { hour12: false })
  });
}

// ─── Init ───────────────────────────────────────────────────────────────────
export function initScheduler() {
  const startInput = document.getElementById('schedStartTime');
  if (startInput && !startInput.value) {
    startInput.value = getLocalISOString(new Date()).slice(0, 16);
  }
}

// Helper to get local ISO string for datetime-local input
function getLocalISOString(date) {
  const pad = (num) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
