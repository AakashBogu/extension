import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigurationManager } from '../core/config/ConfigurationManager';
import { MemoryConfigurationProvider } from '../core/config/providers/MemoryConfigurationProvider';
import { EnvironmentManager } from '../core/config/EnvironmentManager';

describe('Module 1E: Configuration Manager & Environment', () => {
  let configManager: ConfigurationManager;

  beforeEach(() => {
    configManager = new ConfigurationManager(new MemoryConfigurationProvider());
  });

  it('should load default configuration cleanly', async () => {
    const config = await configManager.loadConfig();
    expect(config.env).toBe('development');
    expect(config.defaultAiProvider).toBe('gemini-1.5-flash');
  });

  it('should update configuration and support snapshot rollbacks', async () => {
    await configManager.loadConfig();
    await configManager.updateConfig({ logLevel: 'debug' });
    expect(configManager.get('logLevel')).toBe('debug');

    configManager.rollback();
    expect(configManager.get('logLevel')).toBe('info');
  });

  it('should manage environments correctly using EnvironmentManager', () => {
    const envManager = new EnvironmentManager('development');
    expect(envManager.getEnvironmentMetadata().isDevelopment).toBe(true);

    envManager.setEnvironment('production');
    expect(envManager.getEnvironmentMetadata().isProduction).toBe(true);
  });
});
