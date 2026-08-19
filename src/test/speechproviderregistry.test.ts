import { describe, it, expect } from 'vitest';
import { SpeechProviderRegistry } from '../core/speech/provider/SpeechProviderRegistry';
import { NullSpeechRecognitionProvider } from '../core/speech/provider/NullSpeechRecognitionProvider';

describe('Module 4: SpeechProviderRegistry', () => {
  it('should register, list, and unregister speech recognition providers cleanly', () => {
    const registry = new SpeechProviderRegistry();
    const provider = new NullSpeechRecognitionProvider();

    registry.registerProvider(provider);
    expect(registry.listProviders().length).toBe(1);
    expect(registry.getProvider(provider.id)).toBe(provider);

    registry.unregisterProvider(provider.id);
    expect(registry.listProviders().length).toBe(0);
  });
});
