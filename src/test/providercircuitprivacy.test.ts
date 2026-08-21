import { describe, it, expect } from 'vitest';
import { ProviderReliabilityRecoveryManager } from '../core/providers/recovery/ProviderReliabilityRecoveryManager';

describe('Module 6F.9: Privacy & Security Audit', () => {
  it('should never contain credentials, raw prompts, search queries, or payloads in circuit records', () => {
    const manager = new ProviderReliabilityRecoveryManager();
    manager.recordFailure('ai.p7', 'Secret Bearer token failure');

    const rec = manager.getCircuitRecord('ai.p7');
    const jsonStr = JSON.stringify(rec);

    expect(jsonStr).not.toContain('Bearer');
    expect(jsonStr).not.toContain('apiKey');
    expect(jsonStr).not.toContain('prompt');
  });
});
