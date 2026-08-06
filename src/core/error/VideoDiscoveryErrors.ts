import { AppError } from './AppError';

export class VideoDiscoveryError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_VIDEO_DISCOVERY', details);
    this.name = 'VideoDiscoveryError';
  }
}

export class RegistryError extends AppError {
  constructor(videoId: string, reason: string) {
    super(`Video registry error for [${videoId}]: ${reason}`, 'ERR_VIDEO_REGISTRY', { videoId, reason });
    this.name = 'RegistryError';
  }
}

export class MetadataError extends AppError {
  constructor(reason: string) {
    super(`Metadata extraction failed: ${reason}`, 'ERR_VIDEO_METADATA');
    this.name = 'MetadataError';
  }
}

export class DiscoveryTimeoutError extends AppError {
  constructor(timeoutMs: number) {
    super(`Video discovery scan timed out after ${timeoutMs}ms`, 'ERR_DISCOVERY_TIMEOUT', { timeoutMs });
    this.name = 'DiscoveryTimeoutError';
  }
}
