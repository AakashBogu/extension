import { describe, it, expect } from 'vitest';
import { PreferencesManager } from '../core/config/PreferencesManager';
import { SecretsManager } from '../core/config/SecretsManager';

describe('Module 1E: Preferences & Secrets Management', () => {
  it('should update user preferences correctly', () => {
    const prefsManager = new PreferencesManager();
    expect(prefsManager.getPreferences().theme).toBe('dark');

    prefsManager.updatePreferences({ theme: 'light' });
    expect(prefsManager.getPreferences().theme).toBe('light');
  });

  it('should store and retrieve encrypted secrets', async () => {
    const secretsManager = new SecretsManager();
    await secretsManager.setSecret('GEMINI_API_KEY', 'AIzaSyTestKey123');

    const retrieved = await secretsManager.getSecret('GEMINI_API_KEY');
    expect(retrieved).toBe('AIzaSyTestKey123');
  });
});
