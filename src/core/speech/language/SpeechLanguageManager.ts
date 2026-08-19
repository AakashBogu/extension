export class SpeechLanguageManager {
  private currentLanguage = 'en-US';
  private supportedLanguages = new Set(['en-US', 'en-GB', 'ur-PK', 'hi-IN', 'sd-PK']);

  setLanguage(lang: string): void {
    if (this.supportedLanguages.has(lang)) {
      this.currentLanguage = lang;
    }
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): string[] {
    return Array.from(this.supportedLanguages);
  }
}
