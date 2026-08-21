import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';
import { ProviderCooldownManager } from '../core/providers/limits/ProviderCooldownManager';

describe('Module 6F.9: Circuit Breaker and Cooldown Coexistence', () => {
  it('should enforce stricter condition between cooldown and circuit breaker', () => {
    const recovery = new ProviderReliabilityRecoveryManager();
    const cooldown = new ProviderCooldownManager();

    cooldown.startCooldown('ai.p5', 'PROVIDER_RESPONSE', 'HTTP 429 Rate limit exceeded', 30000);
    recovery.recordFailure('ai.p5', 'HTTP 429 Rate limit exceeded');

    expect(cooldown.isInCooldown('ai.p5')).toBe(true);
    expect(recovery.getCircuitState('ai.p5')).toBe('CLOSED'); // Single failure does not open circuit
  });
});
