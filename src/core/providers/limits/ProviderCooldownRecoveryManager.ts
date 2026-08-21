import { ExtendedProviderCooldownState } from './ProviderCooldownState';
import { IEventBus } from '../../events/IEventBus';

export class ProviderCooldownRecoveryManager {
  private activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private eventBus?: IEventBus) {}

  isRecoveryDue(state: ExtendedProviderCooldownState, now: number = Date.now()): boolean {
    return state.inCooldown && now >= state.expiresAt && state.status !== 'RECOVERED';
  }

  scheduleRecovery(state: ExtendedProviderCooldownState, onRecoveryDue: (entityKey: string) => void): void {
    const entityKey = state.modelId ? `${state.providerId}:${state.modelId}` : state.providerId;
    this.clearTimer(entityKey);

    const delay = Math.max(0, state.expiresAt - Date.now());
    const timer = setTimeout(() => {
      this.activeTimers.delete(entityKey);
      if (this.eventBus) {
        this.eventBus.publish('provider.cooldown_expired', {
          providerId: state.providerId,
          modelId: state.modelId,
          timestamp: Date.now()
        });
      }
      onRecoveryDue(entityKey);
    }, delay);

    this.activeTimers.set(entityKey, timer);
  }

  clearTimer(entityKey: string): void {
    const timer = this.activeTimers.get(entityKey);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(entityKey);
    }
  }

  reset(): void {
    this.activeTimers.forEach(t => clearTimeout(t));
    this.activeTimers.clear();
  }

  destroy(): void {
    this.reset();
  }
}
