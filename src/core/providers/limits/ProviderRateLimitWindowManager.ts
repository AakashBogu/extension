import { RateLimitWindow } from './ProviderRateLimitTypes';

export class ProviderRateLimitWindowManager {
  static getWindowDurationMs(window: RateLimitWindow, customWindowMs?: number): number {
    switch (window) {
      case 'SECOND': return 1000;
      case 'MINUTE': return 60000;
      case 'HOUR': return 3600000;
      case 'DAY': return 86400000;
      case 'MONTH': return 2592000000; // 30 days
      case 'CUSTOM': return customWindowMs || 60000;
    }
  }

  static getWindowBounds(window: RateLimitWindow, now: number = Date.now(), customWindowMs?: number): { windowStart: number; windowEnd: number; resetTimestamp: number } {
    const duration = this.getWindowDurationMs(window, customWindowMs);
    const windowStart = Math.floor(now / duration) * duration;
    const windowEnd = windowStart + duration;
    return {
      windowStart,
      windowEnd,
      resetTimestamp: windowEnd
    };
  }
}
