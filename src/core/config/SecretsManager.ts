import { SecretsError } from '../error/ConfigErrors';

export interface ISecretProvider {
  setSecret(key: string, value: string): Promise<void>;
  getSecret(key: string): Promise<string | null>;
  deleteSecret(key: string): Promise<void>;
}

export class MemorySecretProvider implements ISecretProvider {
  private secrets = new Map<string, string>();

  async setSecret(key: string, value: string): Promise<void> {
    if (!key || !value) throw new SecretsError('Key and value required');
    this.secrets.set(key, Buffer.from(value).toString('base64'));
  }

  async getSecret(key: string): Promise<string | null> {
    const encoded = this.secrets.get(key);
    if (!encoded) return null;
    return Buffer.from(encoded, 'base64').toString('utf8');
  }

  async deleteSecret(key: string): Promise<void> {
    this.secrets.delete(key);
  }
}

export class SecretsManager {
  private provider: ISecretProvider;

  constructor(provider?: ISecretProvider) {
    this.provider = provider || new MemorySecretProvider();
  }

  async setSecret(key: string, secretValue: string): Promise<void> {
    await this.provider.setSecret(key, secretValue);
  }

  async getSecret(key: string): Promise<string | null> {
    return await this.provider.getSecret(key);
  }

  async deleteSecret(key: string): Promise<void> {
    await this.provider.deleteSecret(key);
  }
}
