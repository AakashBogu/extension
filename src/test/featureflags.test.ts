import { describe, it, expect, beforeEach } from 'vitest';
import { FeatureFlagManager, FeatureFlag } from '../core/config/FeatureFlagManager';

describe('Module 1E: Feature Flag Manager', () => {
  let flagManager: FeatureFlagManager;

  beforeEach(() => {
    flagManager = new FeatureFlagManager();
  });

  it('should register and evaluate feature flags', () => {
    const flag: FeatureFlag = {
      id: 'beta_ocr',
      name: 'Beta OCR Parser',
      description: 'Enable Tesseract WASM video parser',
      defaultEnabled: false,
      environments: ['development', 'staging']
    };

    flagManager.registerFlag(flag);
    expect(flagManager.isEnabled('beta_ocr', 'development')).toBe(false);
    expect(flagManager.isEnabled('beta_ocr', 'production')).toBe(false);
  });

  it('should support runtime flag overrides', () => {
    flagManager.registerFlag({
      id: 'debug_hud',
      name: 'Debug HUD',
      description: 'Display debug overlay',
      defaultEnabled: false
    });

    expect(flagManager.isEnabled('debug_hud')).toBe(false);
    flagManager.setOverride('debug_hud', true);
    expect(flagManager.isEnabled('debug_hud')).toBe(true);
  });
});
