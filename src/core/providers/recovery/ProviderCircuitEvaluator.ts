import { ProviderCircuitPolicy } from './ProviderCircuitPolicy';
import { ProviderCircuitRecord } from './ProviderCircuitState';

export class ProviderCircuitEvaluator {
  static evaluateOutcome(
    record: ProviderCircuitRecord,
    policy: ProviderCircuitPolicy,
    isSuccess: boolean,
    now: number = Date.now()
  ): ProviderCircuitRecord {
    if (!policy.enabled) return record;

    let { state, consecutiveFailures, consecutiveSuccesses, totalSuccesses, totalFailures, recoveryAttemptCount, openUntil, halfOpenProbeInFlight } = record;
    const rollingHistory = record.rollingSampleCount;

    if (isSuccess) {
      totalSuccesses++;
      consecutiveSuccesses++;
      consecutiveFailures = 0;

      if (state === 'HALF_OPEN') {
        if (consecutiveSuccesses >= policy.successesToClose) {
          state = 'CLOSED';
          recoveryAttemptCount = 0;
          openUntil = undefined;
          halfOpenProbeInFlight = false;
        }
      }
    } else {
      totalFailures++;
      consecutiveFailures++;
      consecutiveSuccesses = 0;

      if (state === 'CLOSED') {
        const total = totalSuccesses + totalFailures;
        const rollingRate = total > 0 ? totalFailures / total : 0;
        const reachedConsecutive = consecutiveFailures >= policy.failureThreshold;
        const reachedRolling = total >= policy.minimumRollingSamples && rollingRate >= policy.rollingFailureThreshold;

        if (reachedConsecutive || reachedRolling) {
          state = 'OPEN';
          recoveryAttemptCount = 1;
          const duration = Math.min(policy.maxOpenDurationMs, policy.openDurationMs);
          openUntil = now + duration;
        }
      } else if (state === 'HALF_OPEN') {
        state = 'OPEN';
        recoveryAttemptCount++;
        const duration = Math.min(
          policy.maxOpenDurationMs,
          policy.openDurationMs * Math.pow(policy.failureBackoffFactor, recoveryAttemptCount - 1)
        );
        openUntil = now + duration;
        halfOpenProbeInFlight = false;
      }
    }

    const totalReqs = totalSuccesses + totalFailures;
    const rollingFailureRate = totalReqs > 0 ? parseFloat((totalFailures / totalReqs).toFixed(4)) : 0;

    return {
      providerId: record.providerId,
      state,
      consecutiveFailures,
      consecutiveSuccesses,
      totalSuccesses,
      totalFailures,
      rollingFailureRate,
      rollingSampleCount: Math.min(200, rollingHistory + 1),
      lastSuccessAt: isSuccess ? now : record.lastSuccessAt,
      lastFailureAt: !isSuccess ? now : record.lastFailureAt,
      stateChangedAt: state !== record.state ? now : record.stateChangedAt,
      openUntil,
      halfOpenProbeInFlight,
      recoveryAttemptCount
    };
  }

  static checkStateTransition(record: ProviderCircuitRecord, now: number = Date.now()): ProviderCircuitRecord {
    if (record.state === 'OPEN' && record.openUntil && now >= record.openUntil) {
      return {
        ...record,
        state: 'HALF_OPEN',
        stateChangedAt: now,
        halfOpenProbeInFlight: false
      };
    }
    return record;
  }
}
