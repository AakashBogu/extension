import { ProviderError, ProviderErrorOptions } from './ProviderErrors';

export class ProviderCacheError extends ProviderError {
  constructor(message: string, code: string = 'ERR_PROVIDER_CACHE', options?: ProviderErrorOptions) {
    super(message, code, options);
    this.name = 'ProviderCacheError';
  }
}

export class ProviderCacheKeyError extends ProviderCacheError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CACHE_KEY', options);
    this.name = 'ProviderCacheKeyError';
  }
}

export class ProviderCacheCapacityError extends ProviderCacheError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CACHE_CAPACITY', options);
    this.name = 'ProviderCacheCapacityError';
  }
}

export class ProviderCacheSerializationError extends ProviderCacheError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CACHE_SERIALIZATION', options);
    this.name = 'ProviderCacheSerializationError';
  }
}

export class ProviderCacheInvalidationError extends ProviderCacheError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CACHE_INVALIDATION', options);
    this.name = 'ProviderCacheInvalidationError';
  }
}

export class ProviderCacheInternalError extends ProviderCacheError {
  constructor(message: string, options?: ProviderErrorOptions) {
    super(message, 'ERR_PROVIDER_CACHE_INTERNAL', options);
    this.name = 'ProviderCacheInternalError';
  }
}
