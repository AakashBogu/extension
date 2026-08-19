import { describe, it, expect } from 'vitest';
import { SpeechLanguageManager } from '../core/speech/language/SpeechLanguageManager';

describe('Module 4: SpeechLanguageManager', () => {
  it('should manage current language and validate supported language list', () => {
    const langManager = new SpeechLanguageManager();
    expect(langManager.getLanguage()).toBe('en-US');

    langManager.setLanguage('ur-PK');
    expect(langManager.getLanguage()).toBe('ur-PK');

    langManager.setLanguage('unsupported');
    expect(langManager.getLanguage()).toBe('ur-PK'); // Unchanged
  });
});
