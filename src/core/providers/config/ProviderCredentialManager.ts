import { SecretsManager } from '../../config/SecretsManager';
import { ProviderConfigurationError } from '../../error/ProviderErrors';

export class ProviderCredentialManager {
  constructor(private secretsManager?: SecretsManager) {}

  async getCredential(providerId: string, credentialKey?: string): Promise<string> {
    const key = credentialKey || `provider.key.${providerId}`;
    let secret: string | null = null;

    if (this.secretsManager) {
      secret = await this.secretsManager.getSecret(key);
    }

    if (!secret && typeof process !== 'undefined' && process.env) {
      const envKey = key.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      secret = process.env[envKey] || null;
    }

    if (!secret) {
      throw new ProviderConfigurationError(`Missing required credential for provider [${providerId}]`, { providerId });
    }

    return secret;
  }
}
