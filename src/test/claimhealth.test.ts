import { describe, it, expect } from 'vitest';
import { ClaimDetectionHealthMonitor } from '../core/claims/health/ClaimDetectionHealthMonitor';
import { EventBus } from '../core/events/EventBus';

describe('Module 5: ClaimDetectionHealthMonitor', () => {
  it('should check and report claim detection subsystem health', async () => {
    const eventBus = new EventBus();
    const monitor = new ClaimDetectionHealthMonitor(eventBus);
    const report = await monitor.checkHealth();

    expect(report.status).toBe('HEALTHY');
  });
});
