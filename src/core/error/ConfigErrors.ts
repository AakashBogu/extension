import { AppError } from './AppError';

export class ConfigurationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_CONFIG', details);
    this.name = 'ConfigurationError';
  }
}

export class ValidationError extends AppError {
  constructor(field: string, reason: string) {
    super(`Configuration validation failed for [${field}]: ${reason}`, 'ERR_CONFIG_VALIDATION', { field, reason });
    this.name = 'ValidationError';
  }
}

export class MigrationError extends AppError {
  constructor(fromVersion: number, toVersion: number, reason: string) {
    super(`Config migration from v${fromVersion} to v${toVersion} failed: ${reason}`, 'ERR_CONFIG_MIGRATION', { fromVersion, toVersion, reason });
    this.name = 'MigrationError';
  }
}

export class ProviderError extends AppError {
  constructor(providerName: string, reason: string) {
    super(`Config provider [${providerName}] error: ${reason}`, 'ERR_CONFIG_PROVIDER', { providerName, reason });
    this.name = 'ProviderError';
  }
}

export class SecretsError extends AppError {
  constructor(reason: string) {
    super(`Secrets management error: ${reason}`, 'ERR_SECRETS');
    this.name = 'SecretsError';
  }
}

export class EnvironmentError extends AppError {
  constructor(env: string, reason: string) {
    super(`Environment [${env}] error: ${reason}`, 'ERR_ENVIRONMENT', { env, reason });
    this.name = 'EnvironmentError';
  }
}
