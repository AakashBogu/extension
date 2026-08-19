import { describe, it, expect } from 'vitest';
import { SpeechRecognitionHealthMonitor } from '../core/speech/health/SpeechRecognitionHealthMonitor';
import { RecognitionSessionManager } from '../core/speech/session/RecognitionSessionManager';
import { SpeechProviderRegistry } from '../core/speech/provider/SpeechProviderRegistry';
import { SpeechProviderRouter } from '../core/speech/provider/SpeechProviderRouter';
import { NullSpeechRecognitionProvider } from '../core/speech/provider/NullSpeechRecognitionProvider';
import { EventBus } from '../core/events/EventBus';

describe('Module 4: SpeechRecognitionHealthMonitor', () => {
  it('should report speech recognition subsystem health status', async () => {
    const registry = new SpeechProviderRegistry();
    const provider = new NullSpeechRecognitionProvider();
    await provider.initialize();
    registry.registerProvider(provider);

    const router = new SpeechProviderRouter(registry);
    const sessionManager = new RecognitionSessionManager();
    const eventBus = new EventBus();

    const healthMonitor = new SpeechRecognitionHealthMonitor(sessionManager, router, eventBus);
    const report = await healthMonitor.checkHealth();

    expect(report.status).toBe('HEALTHY');
  });
});
