import { OpenAIConfig, GeminiConfig, BraveConfig, BingConfig } from './ProviderConfiguration';
import { ProviderConfigurationError } from '../../error/ProviderErrors';

export class ProviderConfigurationValidator {
  static validateOpenAI(config: OpenAIConfig): void {
    if (!config.endpoint || typeof config.endpoint !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing OpenAI endpoint');
    }
    if (!config.model || typeof config.model !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing OpenAI model');
    }
    if (config.timeoutMs <= 0) {
      throw new ProviderConfigurationError('OpenAI timeoutMs must be positive');
    }
  }

  static validateGemini(config: GeminiConfig): void {
    if (!config.endpoint || typeof config.endpoint !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing Gemini endpoint');
    }
    if (!config.model || typeof config.model !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing Gemini model');
    }
    if (config.timeoutMs <= 0) {
      throw new ProviderConfigurationError('Gemini timeoutMs must be positive');
    }
  }

  static validateBrave(config: BraveConfig): void {
    if (!config.endpoint || typeof config.endpoint !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing Brave Search endpoint');
    }
    if (config.maxResults <= 0) {
      throw new ProviderConfigurationError('Brave Search maxResults must be positive');
    }
    if (config.timeoutMs <= 0) {
      throw new ProviderConfigurationError('Brave Search timeoutMs must be positive');
    }
  }

  static validateBing(config: BingConfig): void {
    if (!config.endpoint || typeof config.endpoint !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing Bing Search endpoint');
    }
    if (config.maxResults <= 0) {
      throw new ProviderConfigurationError('Bing Search maxResults must be positive');
    }
    if (config.timeoutMs <= 0) {
      throw new ProviderConfigurationError('Bing Search timeoutMs must be positive');
    }
  }
}
