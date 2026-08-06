/**
 * Global Error Hierarchy
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_CONFIG', details);
    this.name = 'ConfigurationError';
  }
}

export class ExtensionInitializationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_EXTENSION_INIT', details);
    this.name = 'ExtensionInitializationError';
  }
}
