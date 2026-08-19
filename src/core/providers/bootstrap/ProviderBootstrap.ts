import { AIProviderRegistry } from '../registry/AIProviderRegistry';
import { SearchProviderRegistry } from '../registry/SearchProviderRegistry';
import { ProviderCredentialManager } from '../config/ProviderCredentialManager';
import { ProviderSystemConfig } from '../config/ProviderConfiguration';
import { OpenAIProvider } from '../adapters/ai/OpenAIProvider';
import { GeminiProvider } from '../adapters/ai/GeminiProvider';
import { BraveSearchProvider } from '../adapters/search/BraveSearchProvider';
import { BingSearchProvider } from '../adapters/search/BingSearchProvider';

export class ProviderBootstrap {
  static async bootstrap(
    config: ProviderSystemConfig,
    aiRegistry: AIProviderRegistry,
    searchRegistry: SearchProviderRegistry,
    credentialManager?: ProviderCredentialManager
  ): Promise<void> {
    // 1. OpenAI
    if (config.openai && config.openai.enabled) {
      const openAi = new OpenAIProvider(config.openai, credentialManager);
      await aiRegistry.register(openAi).catch(() => {});
    }

    // 2. Gemini
    if (config.gemini && config.gemini.enabled) {
      const gemini = new GeminiProvider(config.gemini, credentialManager);
      await aiRegistry.register(gemini).catch(() => {});
    }

    // 3. Brave
    if (config.brave && config.brave.enabled) {
      const brave = new BraveSearchProvider(config.brave, credentialManager);
      await searchRegistry.register(brave).catch(() => {});
    }

    // 4. Bing
    if (config.bing && config.bing.enabled) {
      const bing = new BingSearchProvider(config.bing, credentialManager);
      await searchRegistry.register(bing).catch(() => {});
    }
  }
}
