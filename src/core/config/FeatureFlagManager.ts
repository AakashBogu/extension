import { EnvironmentType } from './ConfigTypes';
import { IEventBus } from '../events/IEventBus';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  environments?: EnvironmentType[];
  rolloutPercentage?: number;
  dependencies?: string[];
}

export class FeatureFlagManager {
  private flags = new Map<string, FeatureFlag>();
  private overrides = new Map<string, boolean>();
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus;
  }

  registerFlag(flag: FeatureFlag): void {
    this.flags.set(flag.id, flag);
  }

  isEnabled(flagId: string, currentEnv: EnvironmentType = 'development', userId?: string): boolean {
    if (this.overrides.has(flagId)) {
      return this.overrides.get(flagId)!;
    }

    const flag = this.flags.get(flagId);
    if (!flag) return false;

    if (flag.environments && !flag.environments.includes(currentEnv)) {
      return false;
    }

    if (flag.dependencies) {
      for (const depId of flag.dependencies) {
        if (!this.isEnabled(depId, currentEnv, userId)) {
          return false;
        }
      }
    }

    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = this.hashUser(userId || 'anonymous', flagId);
      return (hash % 100) < flag.rolloutPercentage;
    }

    return flag.defaultEnabled;
  }

  setOverride(flagId: string, enabled: boolean): void {
    this.overrides.set(flagId, enabled);
    if (this.eventBus) {
      this.eventBus.publish('system.config_changed', { flagId, enabled });
    }
  }

  clearOverride(flagId: string): void {
    this.overrides.delete(flagId);
  }

  listFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  private hashUser(user: string, flag: string): number {
    let hash = 0;
    const str = `${user}:${flag}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
