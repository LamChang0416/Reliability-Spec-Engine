import { LANG } from './state.js';

// ─── PWA / Service Worker ──────────────────────────────────────────────────
let deferredPrompt = null;

export function initPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('installBanner');
    banner.style.display = 'block';
    document.getElementById('installBtn').onclick = async () => {
      const pwd = prompt(LANG==='ZH' ? '🔐 請輸入授權密碼以安裝桌面版：' : '🔐 Enter authorization password to install:');
      if (pwd === 'Lam0416') {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome==='accepted') banner.style.display='none';
        deferredPrompt = null;
      } else if (pwd !== null) {
        alert(LANG==='ZH' ? '❌ 密碼錯誤，拒絕存取！' : '❌ Incorrect password, access denied!');
      }
    };
  });

  window.addEventListener('appinstalled', () => {
    document.getElementById('installBanner').style.display='none';
  });

  window.addEventListener('online',  () => document.getElementById('offlineBadge').classList.remove('visible'));
  window.addEventListener('offline', () => document.getElementById('offlineBadge').classList.add('visible'));
  if (!navigator.onLine) document.getElementById('offlineBadge').classList.add('visible');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
  }
}
