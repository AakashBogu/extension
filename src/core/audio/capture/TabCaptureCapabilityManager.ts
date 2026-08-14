import { TabCaptureCapabilities } from './TabAudioCaptureTypes';

export class TabCaptureCapabilityManager {
  detectCapabilities(): TabCaptureCapabilities {
    const tabCaptureAvailable = typeof chrome !== 'undefined' && !!chrome.tabCapture;
    const mediaStreamAvailable = typeof MediaStream !== 'undefined';
    const mediaTrackAvailable = typeof MediaStreamTrack !== 'undefined';
    const audioContextAvailable = typeof AudioContext !== 'undefined';

    return {
      tabCaptureApiAvailable: tabCaptureAvailable,
      mediaStreamAvailable,
      mediaTrackAvailable,
      audioContextAvailable,
      offscreenRuntimeAvailable: typeof chrome !== 'undefined' && !!chrome.offscreen,
      hasTabCapturePermission: tabCaptureAvailable
    };
  }
}
