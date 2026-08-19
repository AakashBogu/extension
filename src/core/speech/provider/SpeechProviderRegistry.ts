import { ISpeechRecognitionProvider } from './ISpeechRecognitionProvider';

export class SpeechProviderRegistry {
  private providers = new Map<string, ISpeechRecognitionProvider>();

  registerProvider(provider: ISpeechRecognitionProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregisterProvider(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      provider.destroy();
      this.providers.delete(providerId);
    }
  }

  getProvider(providerId: string): ISpeechRecognitionProvider | undefined {
    return this.providers.get(providerId);
  }

  listProviders(): ISpeechRecognitionProvider[] {
    return Array.from(this.providers.values()).sort((a, b) => b.capabilities.priority - a.capabilities.priority);
  }

  clear(): void {
    this.providers.forEach(p => p.destroy());
    this.providers.clear();
  }
}
