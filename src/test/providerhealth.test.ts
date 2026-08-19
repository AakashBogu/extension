import { describe, it, expect } from 'vitest';
import { ProviderHealthManager } from '../core/providers/health/ProviderHealthManager';

describe('Module 6B: ProviderHealthManager', () => {
  it('should track health status transitions and consecutive failure thresholds', () => {
    const healthManager = new ProviderHealthManager();

    expect(healthManager.getHealth('p1')).toBe('HEALTHY');

    healthManager.recordFailure('p1', 'Error 1');
    expect(healthManager.getHealth('p1')).toBe('DEGRADED');

    healthManager.recordFailure('p1', 'Error 2');
    expect(healthManager.getHealth('p1')).toBe('DEGRADED');

    healthManager.recordFailure('p1', 'Error 3');
    expect(healthManager.getHealth('p1')).toBe('UNHEALTHY');

    healthManager.recordSuccess('p1', 50);
    expect(healthManager.getHealth('p1')).toBe('HEALTHY');
  });
});
