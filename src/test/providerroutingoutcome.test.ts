import { describe, it, expect } from 'vitest';
import { ProviderRoutingOutcomeTracker } from '../core/providers/router/ProviderRoutingOutcomeTracker';
import { ProviderAdaptiveRoutingPolicy } from '../core/providers/router/ProviderAdaptiveRoutingPolicy';

describe('Module 6F.8: ProviderRoutingOutcomeTracker (Bounded Ring Buffer)', () => {
  it('should record outcomes and update exponential moving average success rate', () => {
    const tracker = new ProviderRoutingOutcomeTracker(5); // max 5 per key
    const policy = new ProviderAdaptiveRoutingPolicy({ requestType: 'AI' });

    tracker.recordOutcome('ai.openai', 'AI', true, 100);
    tracker.recordOutcome('ai.openai', 'AI', true, 120);
    tracker.recordOutcome('ai.openai', 'AI', false, 500);

    const adjustment = tracker.getAdaptiveAdjustment('ai.openai', 'AI', policy);
    expect(adjustment.observationCount).toBe(3);
  });
});
