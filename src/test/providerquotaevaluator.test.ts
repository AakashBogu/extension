import { describe, it, expect } from 'vitest';
import { ProviderQuotaEvaluator } from '../core/providers/limits/ProviderQuotaEvaluator';
import { ProviderQuotaPolicy } from '../core/providers/limits/ProviderQuotaPolicy';
import { QuotaAllocation } from '../core/providers/limits/ProviderQuotaTypes';

describe('Module 6F.6: ProviderQuotaEvaluator', () => {
  it('should calculate utilization ratio and categorize levels correctly', () => {
    const policy = new ProviderQuotaPolicy({ warningThresholdRatio: 0.8 });
    const alloc: QuotaAllocation = { scope: 'PROVIDER', dimension: 'REQUESTS', allocatedLimit: 10, period: 'DAILY' };

    const stateNormal = ProviderQuotaEvaluator.evaluateAllocation(alloc, null, policy, 2);
    expect(stateNormal.utilizationRatio).toBe(0.2);
    expect(stateNormal.level).toBe('NORMAL');

    const stateWarn = ProviderQuotaEvaluator.evaluateAllocation(alloc, null, policy, 8);
    expect(stateWarn.level).toBe('WARNING');

    const stateCrit = ProviderQuotaEvaluator.evaluateAllocation(alloc, null, policy, 9);
    expect(stateCrit.level).toBe('CRITICAL');

    const stateExhausted = ProviderQuotaEvaluator.evaluateAllocation(alloc, null, policy, 10);
    expect(stateExhausted.isExhausted).toBe(true);
    expect(stateExhausted.level).toBe('EXHAUSTED');
  });
});
