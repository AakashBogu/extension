import { AppError } from './AppError';

export class LoggingError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Logging error: ${message}`, 'ERR_LOGGING', details);
    this.name = 'LoggingError';
  }
}

export class MetricsError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Metrics error: ${message}`, 'ERR_METRICS', details);
    this.name = 'MetricsError';
  }
}

export class TracingError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Tracing error: ${message}`, 'ERR_TRACING', details);
    this.name = 'TracingError';
  }
}

export class ProfilingError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Profiling error: ${message}`, 'ERR_PROFILING', details);
    this.name = 'ProfilingError';
  }
}

export class DiagnosticsError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Diagnostics error: ${message}`, 'ERR_DIAGNOSTICS', details);
    this.name = 'DiagnosticsError';
  }
}

export class HealthCheckError extends AppError {
  constructor(component: string, message: string) {
    super(`Health check failed for [${component}]: ${message}`, 'ERR_HEALTH_CHECK', { component });
    this.name = 'HealthCheckError';
  }
}
