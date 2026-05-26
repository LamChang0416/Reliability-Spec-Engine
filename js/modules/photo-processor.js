import { LANG } from '../core/state.js';

// ─── Photo Processor (Canvas-based WebP + Watermark) ──────────────────────

const DB_NAME = 'SpecEnginePhotos';
const STORE_NAME = 'photos';

// ── IndexedDB helpers ──
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}

export async function savePhoto(blob, metadata) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = { blob, metadata, timestamp: Date.now() };
    const req = store.add(record);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllPhotos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// ── Canvas compression + watermark ──
export function processImage(file, options = {}) {
  const quality = options.quality || 0.85;
  const watermarkText = options.watermarkText || '';
  const maxWidth = options.maxWidth || 1920;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Scale down if needed
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }

        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Draw image
        ctx.drawImage(img, 0, 0, w, h);

        // Apply watermark if provided
        if (watermarkText) {
          const fontSize = Math.max(14, Math.round(w * 0.025));
          ctx.save();
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.45)';
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;

          const lines = watermarkText.split('\n');
          const lineHeight = fontSize * 1.4;
          const x = 20;
          let y = h - (lines.length * lineHeight) - 10;

          // Background bar
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillRect(0, y - fontSize - 5, w, lines.length * lineHeight + 20);

          // Text
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          lines.forEach((line, i) => {
            ctx.fillText(line, x, y + i * lineHeight);
            ctx.strokeText(line, x, y + i * lineHeight);
          });
          ctx.restore();
        }

        // Export as WebP
        canvas.toBlob(blob => {
          if (blob) {
            resolve({
              blob,
              width: w,
              height: h,
              originalSize: file.size,
              compressedSize: blob.size,
              ratio: ((1 - blob.size / file.size) * 100).toFixed(1)
            });
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, 'image/webp', quality);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

// ── UI Initialization ──
export function initPhotoPanel() {
  const dropZone = document.getElementById('photoDropZone');
  const fileInput = document.getElementById('photoFileInput');
  const preview = document.getElementById('photoPreview');
  const qualitySlider = document.getElementById('photoQuality');
  const qualityLabel = document.getElementById('photoQualityLabel');

  if (!dropZone) return;

  // Drag & drop
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = '#00d284'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'rgba(99,179,237,.3)'; });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = 'rgba(99,179,237,.3)';
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => { if (e.target.files.length) handleFile(e.target.files[0]); });

  qualitySlider.addEventListener('input', () => {
    qualityLabel.textContent = qualitySlider.value + '%';
  });

  refreshPhotoGallery();
}

let currentFile = null;

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert(LANG === 'ZH' ? '請選擇圖片檔案' : 'Please select an image file');
    return;
  }
  currentFile = file;
  document.getElementById('photoOrigInfo').textContent = `${file.name} (${(file.size/1024).toFixed(0)} KB)`;
  await processAndPreview();
}

async function processAndPreview() {
  if (!currentFile) return;
  const quality = parseInt(document.getElementById('photoQuality').value) / 100;
  const watermark = document.getElementById('photoWatermark').value;

  try {
    const result = await processImage(currentFile, { quality, watermarkText: watermark });
    const url = URL.createObjectURL(result.blob);
    document.getElementById('photoPreviewImg').src = url;
    document.getElementById('photoPreviewImg').style.display = 'block';
    document.getElementById('photoCompInfo').textContent =
      `WebP: ${(result.compressedSize/1024).toFixed(0)} KB (壓縮 ${result.ratio}%) | ${result.width}×${result.height}`;

    // Store result for download/save
    window._lastPhotoResult = result;
  } catch(e) {
    console.error('Photo processing error:', e);
  }
}

// Expose to window for inline event handlers
window._processAndPreview = processAndPreview;

window._downloadPhoto = function() {
  if (!window._lastPhotoResult) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(window._lastPhotoResult.blob);
  a.download = (currentFile?.name?.replace(/\.[^.]+$/,'') || 'photo') + '.webp';
  a.click();
};

window._savePhotoToReport = async function() {
  if (!window._lastPhotoResult) return;
  const watermark = document.getElementById('photoWatermark').value;
  await savePhoto(window._lastPhotoResult.blob, {
    name: currentFile?.name || 'photo',
    watermark,
    width: window._lastPhotoResult.width,
    height: window._lastPhotoResult.height
  });
  alert(LANG === 'ZH' ? '✅ 照片已儲存至報告庫！' : '✅ Photo saved to report library!');
  refreshPhotoGallery();
};

async function refreshPhotoGallery() {
  const gallery = document.getElementById('photoGallery');
  if (!gallery) return;
  try {
    const photos = await getAllPhotos();
    if (photos.length === 0) {
      gallery.innerHTML = `<div class="empty">${LANG==='ZH'?'尚無儲存的照片':'No saved photos'}</div>`;
      return;
    }
    gallery.innerHTML = photos.map(p => {
      const url = URL.createObjectURL(p.blob);
      return `<div style="display:inline-block;margin:4px;position:relative;">
        <img src="${url}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;border:1px solid rgba(99,179,237,.2);">
        <button onclick="window._deletePhotoById(${p.id})" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.6);border:none;color:#fc8181;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:12px;">✕</button>
      </div>`;
    }).join('');
  } catch(e) { console.error(e); }
}

window._deletePhotoById = async function(id) {
  await deletePhoto(id);
  refreshPhotoGallery();
};
