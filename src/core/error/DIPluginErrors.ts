import { AppError } from './AppError';

export class ServiceNotFoundError extends AppError {
  constructor(serviceId: string) {
    super(`Service not found for identifier: ${serviceId}`, 'ERR_SERVICE_NOT_FOUND', { serviceId });
    this.name = 'ServiceNotFoundError';
  }
}

export class DuplicateServiceError extends AppError {
  constructor(serviceId: string) {
    super(`Service already registered for identifier: ${serviceId}`, 'ERR_DUPLICATE_SERVICE', { serviceId });
    this.name = 'DuplicateServiceError';
  }
}

export class CircularDependencyError extends AppError {
  constructor(cyclePath: string[]) {
    super(`Circular dependency detected: ${cyclePath.join(' -> ')}`, 'ERR_CIRCULAR_DEPENDENCY', { cyclePath });
    this.name = 'CircularDependencyError';
  }
}

export class InvalidPluginError extends AppError {
  constructor(pluginId: string, reason: string) {
    super(`Invalid plugin [${pluginId}]: ${reason}`, 'ERR_INVALID_PLUGIN', { pluginId, reason });
    this.name = 'InvalidPluginError';
  }
}

export class InvalidProviderError extends AppError {
  constructor(providerId: string, reason: string) {
    super(`Invalid provider [${providerId}]: ${reason}`, 'ERR_INVALID_PROVIDER', { providerId, reason });
    this.name = 'InvalidProviderError';
  }
}
