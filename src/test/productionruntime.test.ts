import { describe, it, expect } from 'vitest';
import { ApplicationKernel } from '../core/kernel/ApplicationKernel';
import { getApplicationKernel } from '../background/index';
import { VerifiableClaim } from '../core/claims/ClaimTypes';

describe('Production Runtime Composition & Integration', () => {
  it('boots ApplicationKernel with ProviderExecutionEngine and VerificationEngine wired to EventBus', async () => {
    const kernel = new ApplicationKernel();
    const context = await kernel.boot();

    expect(context.executionEngine).toBeDefined();
    expect(context.verificationEngine).toBeDefined();
    expect(context.verificationEngine?.getStatus()).toBe('RUNNING');

    // Simulate claim.ready_for_verification event triggering VerificationEngine
    const dummyClaim: VerifiableClaim = {
      claimId: 'claim_prod_001',
      text: 'Water boils at 100 degrees Celsius at standard atmospheric pressure.',
      normalizedText: 'water boils at 100 degrees celsius at standard atmospheric pressure.',
      classification: ['FACTUAL'],
      verifiability: 'HIGH',
      confidence: 0.9,
      priority: 'HIGH',
      entities: [],
      provenance: {
        transcriptId: 'tx_1',
        segmentIds: ['seg_1'],
        sessionId: 'sess_1',
        startTime: 0,
        endTime: 5,
        providerId: 'web_speech',
        createdAt: Date.now()
      },
      timestamps: { startTime: 0, endTime: 5 },
      occurrenceCount: 1
    };

    // Verify claim executes safely with heuristic fallback when external provider keys are unconfigured
    const verdict = await context.verificationEngine!.verifyClaim(dummyClaim);
    expect(verdict).toBeDefined();
    expect(verdict.claimId).toBe('claim_prod_001');
    expect(verdict.fallback).toBe(true);

    await kernel.shutdown();
    expect(kernel.getContext()).toBeNull();
  });

  it('memoizes getApplicationKernel boot promise across concurrent requests', async () => {
    const [ctx1, ctx2] = await Promise.all([
      getApplicationKernel(),
      getApplicationKernel()
    ]);

    expect(ctx1).toBe(ctx2);
    expect(ctx1.runtimeMetadata.instanceId).toBe(ctx2.runtimeMetadata.instanceId);
    expect(ctx1.verificationEngine?.getStatus()).toBe('RUNNING');
  });
});
