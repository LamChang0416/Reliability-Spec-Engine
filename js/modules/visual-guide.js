export function openVisualGuide() {
  const modal = document.getElementById('visualGuideModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

export function closeVisualGuide() {
  const modal = document.getElementById('visualGuideModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
