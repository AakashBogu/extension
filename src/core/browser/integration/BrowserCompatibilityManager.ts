import { CompatibilityReport } from './IntegrationTypes';

export class BrowserCompatibilityManager {
  checkCompatibility(): CompatibilityReport {
    const hasShadowDom = typeof Element !== 'undefined' && 'shadowRoot' in Element.prototype;
    const hasIntersectionObserver = typeof IntersectionObserver !== 'undefined';
    const hasChromeRuntime = typeof chrome !== 'undefined' && !!chrome.runtime;
    const hasTabCapture = typeof chrome !== 'undefined' && !!chrome.tabCapture;
    const hasOffscreen = typeof chrome !== 'undefined' && !!chrome.offscreen;

    return {
      isSupported: hasIntersectionObserver,
      browserVendor: hasChromeRuntime ? 'Chromium/Chrome' : 'Standard Browser',
      hasShadowDomSupport: hasShadowDom,
      hasIntersectionObserver,
      hasOffscreenSupport: hasOffscreen,
      hasTabCaptureSupport: hasTabCapture
    };
  }
}
