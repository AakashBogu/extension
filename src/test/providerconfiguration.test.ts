import { describe, it, expect } from 'vitest';
import { ProviderConfigurationValidator } from '../core/providers/config/ProviderConfigurationValidator';
import { ProviderConfigurationError } from '../core/error/ProviderErrors';

describe('Module 6C: ProviderConfigurationValidator', () => {
  it('should validate valid OpenAI configuration', () => {
    expect(() => ProviderConfigurationValidator.validateOpenAI({
      enabled: true,
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      timeoutMs: 5000,
      priority: 10
    })).not.toThrow();
  });

  it('should reject missing endpoint or invalid timeout', () => {
    expect(() => ProviderConfigurationValidator.validateOpenAI({
      enabled: true,
      endpoint: '',
      model: 'gpt-4o',
      timeoutMs: 5000,
      priority: 10
    })).toThrow(ProviderConfigurationError);

    expect(() => ProviderConfigurationValidator.validateOpenAI({
      enabled: true,
      endpoint: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      timeoutMs: -10,
      priority: 10
    })).toThrow(ProviderConfigurationError);
  });
});
