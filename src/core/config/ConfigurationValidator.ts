import { ExtendedAppConfig } from './ConfigTypes';
import { ValidationError } from '../error/ConfigErrors';

export class ConfigurationValidator {
  validate(config: ExtendedAppConfig): void {
    if (!config) {
      throw new ValidationError('root', 'Configuration object cannot be null or undefined');
    }
    if (typeof config.version !== 'number' || config.version < 1) {
      throw new ValidationError('version', 'Version must be a positive integer');
    }
    if (config.maxTokensPerDay !== undefined && config.maxTokensPerDay < 0) {
      throw new ValidationError('maxTokensPerDay', 'Max tokens per day cannot be negative');
    }
  }
}
