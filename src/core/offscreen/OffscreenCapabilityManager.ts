import { OffscreenCapabilities } from './OffscreenRuntimeTypes';

export class OffscreenCapabilityManager {
  detectCapabilities(): OffscreenCapabilities {
    const globalContext = typeof globalThis !== 'undefined'
      ? (globalThis as unknown as { AudioContext?: typeof AudioContext })
      : {};

    const offscreenAvailable = typeof chrome !== 'undefined' && !!chrome.offscreen;
    const audioContextAvailable = typeof AudioContext !== 'undefined' || !!globalContext.AudioContext;
    const audioWorkletAvailable = typeof AudioWorkletNode !== 'undefined';
    const messagingAvailable = typeof chrome !== 'undefined' && !!chrome.runtime;

    return {
      offscreenApiAvailable: offscreenAvailable,
      audioContextAvailable,
      audioWorkletAvailable,
      webAudioAvailable: audioContextAvailable,
      chromeMessagingAvailable: messagingAvailable,
      permissions: {
        offscreen: offscreenAvailable,
        tabCapture: typeof chrome !== 'undefined' && !!chrome.tabCapture,
        storage: typeof chrome !== 'undefined' && !!chrome.storage
      }
    };
  }
}
