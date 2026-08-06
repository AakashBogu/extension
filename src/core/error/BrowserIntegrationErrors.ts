import { AppError } from './AppError';

export class BrowserIntegrationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_BROWSER_INTEGRATION', details);
    this.name = 'BrowserIntegrationError';
  }
}

export class PipelineValidationError extends AppError {
  constructor(ruleName: string, reason: string) {
    super(`Pipeline validation failed for rule [${ruleName}]: ${reason}`, 'ERR_PIPELINE_VALIDATION', { ruleName, reason });
    this.name = 'PipelineValidationError';
  }
}

export class CompatibilityError extends AppError {
  constructor(feature: string) {
    super(`Browser compatibility error: Feature [${feature}] is not supported`, 'ERR_COMPATIBILITY', { feature });
    this.name = 'CompatibilityError';
  }
}

export class CleanupError extends AppError {
  constructor(reason: string) {
    super(`Browser resource cleanup error: ${reason}`, 'ERR_CLEANUP');
    this.name = 'CleanupError';
  }
}

export class HealthCheckError extends AppError {
  constructor(component: string, reason: string) {
    super(`Health check failed for [${component}]: ${reason}`, 'ERR_HEALTH_CHECK', { component, reason });
    this.name = 'HealthCheckError';
  }
}
