import { ExtendedAppConfig } from './ConfigTypes';
import { MigrationError } from '../error/ConfigErrors';

export class ConfigurationMigration {
  migrate(config: ExtendedAppConfig, targetVersion: number): ExtendedAppConfig {
    if (config.version >= targetVersion) {
      return config;
    }

    const migrated = { ...config };

    try {
      if (migrated.version === 1 && targetVersion >= 2) {
        migrated.version = 2;
      }
      return migrated;
    } catch (err) {
      throw new MigrationError(config.version, targetVersion, err instanceof Error ? err.message : String(err));
    }
  }
}
