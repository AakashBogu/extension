import { SpeechProviderRegistry } from './SpeechProviderRegistry';
import { ISpeechRecognitionProvider } from './ISpeechRecognitionProvider';
import { SpeechProviderNotFoundError } from '../errors/SpeechRecognitionErrors';

export class SpeechProviderRouter {
  constructor(private registry: SpeechProviderRegistry) {}

  selectProvider(preferredId?: string, language?: string): ISpeechRecognitionProvider {
    if (preferredId) {
      const preferred = this.registry.getProvider(preferredId);
      if (preferred) return preferred;
    }

    const available = this.registry.listProviders();
    if (available.length === 0) {
      throw new SpeechProviderNotFoundError(preferredId || 'any');
    }

    if (language) {
      const match = available.find(p => p.capabilities.supportedLanguages.includes(language));
      if (match) return match;
    }

    return available[0]; // Highest priority
  }
}
