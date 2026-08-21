import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6F.7: ProviderHealthManager', () => {
  it('should track success, failure, and update health status cleanly', () => {
    const manager = new ProviderHealthManager();

    manager.recordSuccess('ai.openai', 150);
    expect(manager.getHealth('ai.openai')).toBe('HEALTHY');

    manager.recordFailure('ai.openai', 'Timeout');
    expect(manager.getHealth('ai.openai')).toBe('DEGRADED');

    manager.recordFailure('ai.openai', 'Timeout 2');
    manager.recordFailure('ai.openai', 'Timeout 3');
    expect(manager.getHealth('ai.openai')).toBe('UNHEALTHY');
  });
});
