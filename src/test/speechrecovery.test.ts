import { describe, it, expect } from 'vitest';
import { SpeechRecognitionRecoveryManager } from '../core/speech/recovery/SpeechRecognitionRecoveryManager';
import { SpeechProviderRegistry } from '../core/speech/provider/SpeechProviderRegistry';
import { SpeechProviderRouter } from '../core/speech/provider/SpeechProviderRouter';
import { NullSpeechRecognitionProvider } from '../core/speech/provider/NullSpeechRecognitionProvider';
import { EventBus } from '../core/events/EventBus';

describe('Module 4: SpeechRecognitionRecoveryManager', () => {
  it('should handle provider recovery and fallback switching', async () => {
    const registry = new SpeechProviderRegistry();
    const provider = new NullSpeechRecognitionProvider();
    registry.registerProvider(provider);

    const router = new SpeechProviderRouter(registry);
    const eventBus = new EventBus();

    const recoveryManager = new SpeechRecognitionRecoveryManager(router, 2, 10, eventBus);
    await recoveryManager.recover(provider.id, 'Provider disconnected');

    expect(recoveryManager.getRecoveryCount()).toBe(1);
  });
});
