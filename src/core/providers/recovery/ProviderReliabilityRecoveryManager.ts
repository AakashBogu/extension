import { ProviderCircuitPolicy } from './ProviderCircuitPolicy';
import { CircuitState, ProviderCircuitRecord } from './ProviderCircuitState';
import { ProviderCircuitEvaluator } from './ProviderCircuitEvaluator';
import { ProviderRecoveryProbeManager } from './ProviderRecoveryProbeManager';
import { IEventBus } from '../../events/IEventBus';

export class ProviderReliabilityRecoveryManager {
  private records = new Map<string, ProviderCircuitRecord>();
  private policies = new Map<string, ProviderCircuitPolicy>();
  private probeManager = new ProviderRecoveryProbeManager();

  constructor(private eventBus?: IEventBus) {}

  async initialize(): Promise<void> {}

  configurePolicy(providerId: string, policy: ProviderCircuitPolicy): void {
    this.policies.set(providerId, policy);
  }

  getCircuitRecord(providerId: string): ProviderCircuitRecord {
    let rec = this.records.get(providerId);
    if (!rec) {
      rec = {
        providerId,
        state: 'CLOSED',
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        totalSuccesses: 0,
        totalFailures: 0,
        rollingFailureRate: 0,
        rollingSampleCount: 0,
        stateChangedAt: Date.now(),
        halfOpenProbeInFlight: false,
        recoveryAttemptCount: 0
      };
      this.records.set(providerId, rec);
    }

    const updated = ProviderCircuitEvaluator.checkStateTransition(rec);
    if (updated.state !== rec.state) {
      this.records.set(providerId, updated);
      if (this.eventBus && updated.state === 'HALF_OPEN') {
        this.eventBus.publish('provider.circuit_half_open', { providerId, timestamp: Date.now() });
      }
    }
    return updated;
  }

  getCircuitState(providerId: string): CircuitState {
    return this.getCircuitRecord(providerId).state;
  }

  recordSuccess(providerId: string, _latencyMs?: number): void {
    const current = this.getCircuitRecord(providerId);
    const policy = this.policies.get(providerId) || new ProviderCircuitPolicy();
    const updated = ProviderCircuitEvaluator.evaluateOutcome(current, policy, true);

    this.records.set(providerId, updated);

    if (this.eventBus && updated.state !== current.state) {
      if (updated.state === 'CLOSED') {
        this.eventBus.publish('provider.circuit_closed', { providerId, timestamp: Date.now() });
      }
    }
  }

  recordFailure(providerId: string, error: unknown, _latencyMs?: number): void {
    const current = this.getCircuitRecord(providerId);
    const policy = this.policies.get(providerId) || new ProviderCircuitPolicy();

    // Check if failure is circuit breaking
    const errMsg = error instanceof Error ? error.message : String(error);
    const isBreaking = !errMsg.includes('validation') && !errMsg.includes('cancelled');
    if (!isBreaking) return;

    const updated = ProviderCircuitEvaluator.evaluateOutcome(current, policy, false);
    this.records.set(providerId, updated);

    if (this.eventBus && updated.state !== current.state) {
      if (updated.state === 'OPEN') {
        this.eventBus.publish('provider.circuit_opened', {
          providerId,
          reason: errMsg,
          openUntil: updated.openUntil,
          timestamp: Date.now()
        });
      }
    }
  }

  evaluateAdmission(providerId: string, isProbe: boolean = false): { allowed: boolean; decision: string; reason: string; retryAt?: number } {
    const rec = this.getCircuitRecord(providerId);
    const policy = this.policies.get(providerId) || new ProviderCircuitPolicy();

    if (rec.state === 'OPEN') {
      return {
        allowed: false,
        decision: 'CIRCUIT_OPEN',
        reason: `Circuit is OPEN for provider [${providerId}]`,
        retryAt: rec.openUntil
      };
    }

    if (rec.state === 'HALF_OPEN') {
      if (isProbe) {
        if (this.probeManager.canProbe(providerId, policy)) {
          return {
            allowed: true,
            decision: 'ALLOWED_PROBE',
            reason: `Recovery probe permitted for provider [${providerId}]`
          };
        }
        return {
          allowed: false,
          decision: 'CIRCUIT_OPEN',
          reason: `Recovery probe in flight for provider [${providerId}]`
        };
      } else {
        return {
          allowed: false,
          decision: 'CIRCUIT_OPEN',
          reason: `Provider [${providerId}] is in HALF_OPEN recovery state (probe required)`
        };
      }
    }

    return {
      allowed: true,
      decision: 'ALLOWED',
      reason: `Provider [${providerId}] admitted (Circuit CLOSED)`
    };
  }

  canProbe(providerId: string): boolean {
    const rec = this.getCircuitRecord(providerId);
    const policy = this.policies.get(providerId) || new ProviderCircuitPolicy();
    return rec.state === 'HALF_OPEN' && this.probeManager.canProbe(providerId, policy);
  }

  startProbe(providerId: string): string | null {
    const rec = this.getCircuitRecord(providerId);
    const policy = this.policies.get(providerId) || new ProviderCircuitPolicy();
    if (rec.state !== 'HALF_OPEN') return null;

    const probeId = this.probeManager.startProbe(providerId, policy);
    if (probeId) {
      this.records.set(providerId, { ...rec, halfOpenProbeInFlight: true });
      if (this.eventBus) {
        this.eventBus.publish('provider.recovery_probe_started', { providerId, probeId, timestamp: Date.now() });
      }
    }
    return probeId;
  }

  finishProbe(providerId: string, probeId: string, success: boolean): void {
    const finished = this.probeManager.finishProbe(providerId, probeId);
    if (!finished) return;

    if (success) {
      if (this.eventBus) {
        this.eventBus.publish('provider.recovery_probe_succeeded', { providerId, probeId, timestamp: Date.now() });
      }
      this.recordSuccess(providerId);
    } else {
      if (this.eventBus) {
        this.eventBus.publish('provider.recovery_probe_failed', { providerId, probeId, timestamp: Date.now() });
      }
      this.recordFailure(providerId, 'Recovery probe failed');
    }
  }

  reset(providerId?: string): void {
    if (providerId) {
      this.records.delete(providerId);
      this.probeManager.clear(providerId);
    } else {
      this.records.clear();
      this.policies.clear();
      this.probeManager.clear();
    }
  }

  destroy(): void {
    this.reset();
  }
}
