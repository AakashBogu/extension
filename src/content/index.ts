/**
 * Content Script Entrypoint (DOM Inspector & Overlay Mount)
 */
console.log('[FactCheck ContentScript] Content Script injected successfully.');

function mountOverlayShell() {
  if (document.getElementById('factcheck-overlay-root')) return;

  const container = document.createElement('div');
  container.id = 'factcheck-overlay-root';
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });
  const innerDiv = document.createElement('div');
  shadow.appendChild(innerDiv);

  // Render placeholder text safely
  innerDiv.innerHTML = '<div style="position:fixed;top:16px;right:16px;z-index:999999;background:rgba(15,23,42,0.9);color:#f8fafc;padding:12px 16px;border-radius:12px;font-family:sans-serif;font-size:13px;border:1px solid rgba(51,65,85,0.5);box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);"><strong>FactCheck AI</strong> Overlay Shell Mounted</div>';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountOverlayShell);
} else {
  mountOverlayShell();
}
