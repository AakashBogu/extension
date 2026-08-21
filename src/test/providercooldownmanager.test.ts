import { describe, it, expect } from 'vitest';
import { ProviderCooldownManager } from '../core/providers/limits/ProviderCooldownManager';

describe('Module 6F.5: ProviderCooldownManager Lifecycle', () => {
  it('should track cooldown start, active check, remaining ms, and manual clear', () => {
    const manager = new ProviderCooldownManager({ baseDurationMs: 1000 });

    expect(manager.isInCooldown('ai.openai')).toBe(false);
    expect(manager.getRemainingCooldownMs('ai.openai')).toBe(0);

    const cooldown = manager.startCooldown('ai.openai', 'MANUAL', 'Testing cooldown');
    expect(cooldown.inCooldown).toBe(true);
    expect(manager.isInCooldown('ai.openai')).toBe(true);
    expect(manager.getRemainingCooldownMs('ai.openai')).toBeGreaterThan(0);

    const cleared = manager.clearCooldown('ai.openai');
    expect(cleared).toBe(true);
    expect(manager.isInCooldown('ai.openai')).toBe(false);
  });
});
