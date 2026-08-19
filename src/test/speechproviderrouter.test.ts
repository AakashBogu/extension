import { describe, it, expect } from 'vitest';
import { SpeechProviderRegistry } from '../core/speech/provider/SpeechProviderRegistry';
import { SpeechProviderRouter } from '../core/speech/provider/SpeechProviderRouter';
import { NullSpeechRecognitionProvider } from '../core/speech/provider/NullSpeechRecognitionProvider';

describe('Module 4: SpeechProviderRouter', () => {
  it('should route and select providers based on capability and fallback priority', () => {
    const registry = new SpeechProviderRegistry();
    const provider = new NullSpeechRecognitionProvider();
    registry.registerProvider(provider);

    const router = new SpeechProviderRouter(registry);
    const selected = router.selectProvider(undefined, 'en-US');

    expect(selected.id).toBe(provider.id);
  });
});
