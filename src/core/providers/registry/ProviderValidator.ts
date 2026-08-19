import { ISearchProvider } from '../search/ISearchProvider';
import { IAIProvider } from '../ai/IAIProvider';
import { ProviderConfigurationError, ProviderCapabilityError } from '../../error/ProviderErrors';

export class ProviderValidator {
  static validateSearchProvider(provider: ISearchProvider): void {
    if (!provider || typeof provider !== 'object') {
      throw new ProviderConfigurationError('Search provider object is null or undefined');
    }
    if (!provider.id || typeof provider.id !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing search provider ID');
    }
    if (!provider.name || typeof provider.name !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing search provider name', { providerId: provider.id });
    }
    if (typeof provider.initialize !== 'function' || typeof provider.search !== 'function' || typeof provider.healthCheck !== 'function' || typeof provider.destroy !== 'function') {
      throw new ProviderCapabilityError('Search provider is missing required lifecycle/service methods', { providerId: provider.id });
    }
  }

  static validateAIProvider(provider: IAIProvider): void {
    if (!provider || typeof provider !== 'object') {
      throw new ProviderConfigurationError('AI provider object is null or undefined');
    }
    if (!provider.id || typeof provider.id !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing AI provider ID');
    }
    if (!provider.name || typeof provider.name !== 'string') {
      throw new ProviderConfigurationError('Invalid or missing AI provider name', { providerId: provider.id });
    }
    if (typeof provider.initialize !== 'function' || typeof provider.analyze !== 'function' || typeof provider.healthCheck !== 'function' || typeof provider.destroy !== 'function') {
      throw new ProviderCapabilityError('AI provider is missing required lifecycle/service methods', { providerId: provider.id });
    }
  }
}
