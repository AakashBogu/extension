import { ProviderAdaptiveRoutingPolicy } from './ProviderAdaptiveRoutingPolicy';
import { IEventBus } from '../../events/IEventBus';

export interface RoutingOutcomeObservation {
  readonly providerId: string;
  readonly requestType: 'AI' | 'SEARCH';
  readonly success: boolean;
  readonly latencyMs?: number;
  readonly timestamp: number;
}

export class ProviderRoutingOutcomeTracker {
  private observationsMap = new Map<string, RoutingOutcomeObservation[]>();
  private emaSuccessMap = new Map<string, number>();
  private lastSelectedMap = new Map<'AI' | 'SEARCH', string>();

  constructor(
    private readonly maxObservationsPerKey: number = 200,
    private eventBus?: IEventBus
  ) {}

  recordOutcome(
    providerId: string,
    requestType: 'AI' | 'SEARCH',
    success: boolean,
    latencyMs?: number
  ): void {
    const key = `${providerId}:${requestType}`;
    const obs = this.observationsMap.get(key) || [];
    const newRecord: RoutingOutcomeObservation = {
      providerId,
      requestType,
      success,
      latencyMs,
      timestamp: Date.now()
    };

    obs.push(newRecord);
    if (obs.length > this.maxObservationsPerKey) {
      obs.shift(); // Bounded memory ring buffer
    }
    this.observationsMap.set(key, obs);

    // Update Exponential Moving Average (EMA) for success rate
    const currentEma = this.emaSuccessMap.get(key) ?? (success ? 1.0 : 0.0);
    const alpha = 0.15;
    const newObservation = success ? 1.0 : 0.0;
    const updatedEma = parseFloat((alpha * newObservation + (1 - alpha) * currentEma).toFixed(4));
    this.emaSuccessMap.set(key, updatedEma);

    if (this.eventBus) {
      this.eventBus.publish('provider.routing_outcome_recorded', {
        providerId,
        requestType,
        success,
        latencyMs,
        updatedEma,
        timestamp: Date.now()
      });
    }
  }

  recordSelection(providerId: string, requestType: 'AI' | 'SEARCH'): void {
    this.lastSelectedMap.set(requestType, providerId);
  }

  getLastSelected(requestType: 'AI' | 'SEARCH'): string | undefined {
    return this.lastSelectedMap.get(requestType);
  }

  getAdaptiveAdjustment(
    providerId: string,
    requestType: 'AI' | 'SEARCH',
    policy: ProviderAdaptiveRoutingPolicy
  ): { adaptiveAdjustment: number; explorationBonus: number; observationCount: number } {
    const key = `${providerId}:${requestType}`;
    const obs = this.observationsMap.get(key) || [];
    const observationCount = obs.length;

    // EMA adaptive adjustment between -0.05 and +0.05
    const ema = this.emaSuccessMap.get(key) ?? 0.5;
    const adaptiveAdjustment = parseFloat(((ema - 0.5) * 0.10).toFixed(4));

    // Exploration bonus for under-observed providers (up to max 0.05)
    let explorationBonus = 0.0;
    if (observationCount < 10) {
      const ratio = (10 - observationCount) / 10;
      explorationBonus = parseFloat((ratio * policy.explorationBonusMax).toFixed(4));
    }

    return { adaptiveAdjustment, explorationBonus, observationCount };
  }

  clear(providerId?: string): void {
    if (providerId) {
      this.observationsMap.delete(`${providerId}:AI`);
      this.observationsMap.delete(`${providerId}:SEARCH`);
      this.emaSuccessMap.delete(`${providerId}:AI`);
      this.emaSuccessMap.delete(`${providerId}:SEARCH`);
    } else {
      this.observationsMap.clear();
      this.emaSuccessMap.clear();
      this.lastSelectedMap.clear();
    }
  }
}
