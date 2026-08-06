import { IEventBus } from '../events/IEventBus';

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  overlayPosition: { x: number; y: number };
  overlayVisible: boolean;
  fontSize: number;
  highContrast: boolean;
}

export class PreferencesManager {
  private prefs: UserPreferences;
  private eventBus?: IEventBus;

  constructor(initialPrefs?: Partial<UserPreferences>, eventBus?: IEventBus) {
    this.eventBus = eventBus;
    this.prefs = {
      theme: 'dark',
      language: 'en',
      overlayPosition: { x: 16, y: 16 },
      overlayVisible: true,
      fontSize: 14,
      highContrast: false,
      ...initialPrefs
    };
  }

  getPreferences(): UserPreferences {
    return { ...this.prefs };
  }

  updatePreferences(partial: Partial<UserPreferences>): void {
    this.prefs = { ...this.prefs, ...partial };
    if (this.eventBus) {
      this.eventBus.publish('system.config_changed', { preferences: this.prefs });
    }
  }
}
