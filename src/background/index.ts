import { ApplicationKernel } from '../core/kernel/ApplicationKernel';
import { ApplicationContext } from '../core/kernel/ApplicationContext';

/**
 * Background Service Worker Entrypoint
 */
console.log('[FactCheck ServiceWorker] Background Service Worker started successfully.');

let kernelInstance: ApplicationKernel | null = null;
let bootPromise: Promise<ApplicationContext> | null = null;

export async function getApplicationKernel(): Promise<ApplicationContext> {
  if (kernelInstance && kernelInstance.getContext()) {
    return kernelInstance.getContext()!;
  }

  if (!bootPromise) {
    kernelInstance = new ApplicationKernel();
    bootPromise = kernelInstance.boot().catch(err => {
      console.error('[FactCheck ServiceWorker] Kernel boot failed:', err);
      kernelInstance = null;
      bootPromise = null;
      throw err;
    });
  }

  return bootPromise;
}

// Kick off boot asynchronously on service worker start/restart without blocking listener registration
getApplicationKernel()
  .then(() => {
    console.log('[FactCheck ServiceWorker] ApplicationKernel booted and ready.');
  })
  .catch(() => {
    // Error logged in getApplicationKernel; allows retry on next message
  });

// Offscreen Registration helper placeholder
async function setupOffscreenDocument() {
  if (typeof chrome !== 'undefined' && chrome.offscreen) {
    const existing = await chrome.offscreen.hasDocument();
    if (!existing) {
      await chrome.offscreen.createDocument({
        url: 'src/offscreen/index.html',
        reasons: [chrome.offscreen.Reason.USER_MEDIA],
        justification: 'Audio stream capture and VAD processing'
      });
    }
  }
}

if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled?.addListener(() => {
    console.log('[FactCheck ServiceWorker] Extension installed.');
  });

  chrome.runtime.onMessage?.addListener((message, _sender, sendResponse) => {
    if (message.type === 'CHECK_SERVICE_WORKER') {
      sendResponse({ status: 'READY', timestamp: Date.now() });
      return false;
    } else if (message.type === 'REGISTER_OFFSCREEN') {
      setupOffscreenDocument().then(() => sendResponse({ status: 'OFFSCREEN_REGISTERED' }));
      return true;
    } else if (message.type === 'GET_KERNEL_STATUS') {
      getApplicationKernel()
        .then(ctx => {
          sendResponse({
            status: 'READY',
            instanceId: ctx.runtimeMetadata.instanceId,
            hasVerificationEngine: !!ctx.verificationEngine,
            hasExecutionEngine: !!ctx.executionEngine
          });
        })
        .catch(err => {
          sendResponse({ status: 'ERROR', error: String(err) });
        });
      return true;
    }
    return false;
  });
}
