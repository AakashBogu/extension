import { describe, it, expect } from 'vitest';
import { ProviderCredentialManager } from '../core/providers/config/ProviderCredentialManager';
import { SecretsManager, MemorySecretProvider } from '../core/config/SecretsManager';
import { ProviderConfigurationError } from '../core/error/ProviderErrors';

describe('Module 6C: ProviderCredentialManager', () => {
  it('should retrieve credentials from SecretsManager securely', async () => {
    const memoryProvider = new MemorySecretProvider();
    await memoryProvider.setSecret('provider.key.ai.openai', 'secret_key_123');

    const secretsManager = new SecretsManager(memoryProvider);
    const credentialManager = new ProviderCredentialManager(secretsManager);

    const key = await credentialManager.getCredential('ai.openai');
    expect(key).toBe('secret_key_123');
  });

  it('should throw ProviderConfigurationError if secret is missing', async () => {
    const credentialManager = new ProviderCredentialManager();
    await expect(credentialManager.getCredential('missing_provider')).rejects.toThrow(ProviderConfigurationError);
  });
});
