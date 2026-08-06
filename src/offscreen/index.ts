/**
 * Offscreen Document Entrypoint (Audio Capture & Speech STT Pipeline Host)
 */
console.log('[FactCheck Offscreen] Document registered successfully.');

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OFFSCREEN_PING') {
    sendResponse({ status: 'PONG', timestamp: Date.now() });
  }
  return true;
});
