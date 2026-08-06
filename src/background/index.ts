/**
 * Background Service Worker Entrypoint
 */
console.log('[FactCheck ServiceWorker] Background Service Worker started successfully.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[FactCheck ServiceWorker] Extension installed.');
});

// Offscreen Registration helper placeholder
async function setupOffscreenDocument() {
  const existing = await chrome.offscreen.hasDocument();
  if (!existing) {
    await chrome.offscreen.createDocument({
      url: 'src/offscreen/index.html',
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: 'Audio stream capture and VAD processing'
    });
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CHECK_SERVICE_WORKER') {
    sendResponse({ status: 'READY', timestamp: Date.now() });
    return false;
  } else if (message.type === 'REGISTER_OFFSCREEN') {
    setupOffscreenDocument().then(() => sendResponse({ status: 'OFFSCREEN_REGISTERED' }));
    return true;
  }
  return false;
});
