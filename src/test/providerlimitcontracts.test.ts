import { describe, it, expect } from 'vitest';
import { ProviderRateLimitSnapshot, RateLimitState } from '../core/providers/limits/ProviderRateLimitTypes';
import { ProviderQuotaState, QuotaConsumption } from '../core/providers/limits/ProviderQuotaTypes';
import { ProviderUsageRecord } from '../core/providers/limits/ProviderUsageTypes';
import { ProviderLimitPolicy } from '../core/providers/limits/ProviderLimitPolicy';
import { ProviderQuotaPolicy } from '../core/providers/limits/ProviderQuotaPolicy';
import { AdmissionResult, AdmissionDecision } from '../core/providers/limits/ProviderAdmissionTypes';
import { ProviderCooldownState } from '../core/providers/limits/ProviderCooldownTypes';
import {
  ProviderLimitError,
  ProviderRateLimitError,
  ProviderQuotaError,
  ProviderAdmissionError,
  ProviderCapacityError,
  ProviderCooldownError
} from '../core/error/ProviderLimitErrors';

describe('Module 6F.1: Rate-Limit & Quota Contracts', () => {
  it('should support multiple simultaneous rate limits on a provider snapshot', () => {
    const limits: RateLimitState[] = [
      {
        definition: { dimension: 'REQUESTS', window: 'MINUTE', limit: 60 },
        currentUsage: 10,
        remainingCapacity: 50,
        resetTimestamp: Date.now() + 60000
      },
      {
        definition: { dimension: 'TOKENS', window: 'DAY', limit: 1000000 },
        currentUsage: 250000,
        remainingCapacity: 750000,
        resetTimestamp: Date.now() + 86400000
      },
      {
        definition: { dimension: 'CONCURRENT_REQUESTS', window: 'SECOND', limit: 10 },
        currentUsage: 2,
        remainingCapacity: 8,
        resetTimestamp: Date.now() + 1000
      }
    ];

    const snapshot: ProviderRateLimitSnapshot = {
      providerId: 'ai.openai',
      timestamp: Date.now(),
      limits
    };

    expect(snapshot.providerId).toBe('ai.openai');
    expect(snapshot.limits).toHaveLength(3);
    expect(snapshot.limits[0].definition.dimension).toBe('REQUESTS');
    expect(snapshot.limits[1].definition.dimension).toBe('TOKENS');
    expect(snapshot.limits[2].definition.dimension).toBe('CONCURRENT_REQUESTS');
  });

  it('should distinguish quota dimensions and consumption states', () => {
    const consumption: QuotaConsumption = {
      allocation: { scope: 'PROVIDER', dimension: 'COST', allocatedLimit: 100, period: 'MONTHLY' },
      consumedAmount: 85,
      remainingAmount: 15,
      resetTimestamp: Date.now() + 500000,
      isExhausted: false
    };

    const quotaState: ProviderQuotaState = {
      providerId: 'search.brave',
      timestamp: Date.now(),
      quotas: [consumption]
    };

    expect(quotaState.quotas[0].allocation.dimension).toBe('COST');
    expect(quotaState.quotas[0].isExhausted).toBe(false);
  });

  it('should enforce metadata-only privacy constraints on ProviderUsageRecord', () => {
    const usage: ProviderUsageRecord = {
      recordId: 'rec_123',
      providerId: 'ai.gemini',
      requestId: 'req_abc',
      operationType: 'CLAIM_ANALYSIS',
      requestCount: 1,
      inputTokens: 150,
      outputTokens: 45,
      totalTokens: 195,
      estimatedCost: 0.0002,
      durationMs: 320,
      timestamp: Date.now(),
      cacheHit: false,
      metadata: { model: 'gemini-1.5-pro' }
    };

    expect(usage.recordId).toBe('rec_123');
    expect(usage.inputTokens).toBe(150);
    expect(usage.metadata?.model).toBe('gemini-1.5-pro');
  });

  it('should instantiate ProviderLimitPolicy and ProviderQuotaPolicy with default values', () => {
    const limitPolicy = new ProviderLimitPolicy();
    expect(limitPolicy.enabled).toBe(true);
    expect(limitPolicy.enforcementMode).toBe('STRICT');
    expect(limitPolicy.safetyMarginRatio).toBe(0.05);

    const quotaPolicy = new ProviderQuotaPolicy({ dailyLimits: { requests: 500 } });
    expect(quotaPolicy.enabled).toBe(true);
    expect(quotaPolicy.warningThresholdRatio).toBe(0.8);
    expect(quotaPolicy.dailyLimits?.requests).toBe(500);
  });

  it('should validate admission decisions and cooldown state contracts', () => {
    const admission: AdmissionResult = {
      providerId: 'search.bing',
      decision: 'ALLOWED',
      reason: 'Capacity available',
      checkedAt: Date.now(),
      remainingCapacity: 45
    };

    expect(admission.decision).toBe('ALLOWED');

    const cooldown: ProviderCooldownState = {
      providerId: 'ai.openai',
      inCooldown: true,
      reason: 'Rate limit hit (429)',
      source: 'PROVIDER_RESPONSE',
      retryAfterMs: 5000
    };

    expect(cooldown.inCooldown).toBe(true);
    expect(cooldown.source).toBe('PROVIDER_RESPONSE');
  });

  it('should instantiate ProviderLimitErrors hierarchy correctly', () => {
    const baseError = new ProviderLimitError('Limit error');
    expect(baseError.name).toBe('ProviderLimitError');
    expect(baseError.code).toBe('ERR_PROVIDER_LIMIT');

    const rateError = new ProviderRateLimitError('Rate exceeded', { providerId: 'ai.openai', retryAfterMs: 3000 });
    expect(rateError.name).toBe('ProviderRateLimitError');
    expect(rateError.code).toBe('ERR_PROVIDER_RATE_LIMIT');
    expect(rateError.providerId).toBe('ai.openai');
    expect(rateError.retryAfterMs).toBe(3000);

    const quotaError = new ProviderQuotaError('Quota exhausted');
    expect(quotaError.name).toBe('ProviderQuotaError');

    const admissionError = new ProviderAdmissionError('Admission blocked');
    expect(admissionError.name).toBe('ProviderAdmissionError');

    const capacityError = new ProviderCapacityError('Capacity exceeded');
    expect(capacityError.name).toBe('ProviderCapacityError');

    const cooldownError = new ProviderCooldownError('In cooldown', { retryAfterMs: 1500 });
    expect(cooldownError.name).toBe('ProviderCooldownError');
    expect(cooldownError.retryAfterMs).toBe(1500);
  });

  it('should support discriminated union matching on AdmissionDecision', () => {
    function processDecision(decision: AdmissionDecision): string {
      switch (decision) {
        case 'ALLOWED': return 'OK';
        case 'RATE_LIMITED': return 'WAIT_RATE';
        case 'QUOTA_EXHAUSTED': return 'WAIT_QUOTA';
        case 'COOLDOWN': return 'WAIT_COOLDOWN';
        case 'CAPACITY_EXCEEDED': return 'WAIT_CAPACITY';
        case 'DISABLED': return 'DISABLED';
        case 'UNKNOWN': return 'UNKNOWN';
      }
    }

    expect(processDecision('ALLOWED')).toBe('OK');
    expect(processDecision('RATE_LIMITED')).toBe('WAIT_RATE');
    expect(processDecision('COOLDOWN')).toBe('WAIT_COOLDOWN');
  });
});
