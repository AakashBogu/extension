export type ProviderType = 'SEARCH' | 'AI' | 'HYBRID';

export type ProviderStatus =
  | 'UNINITIALIZED'
  | 'INITIALIZING'
  | 'READY'
  | 'RUNNING'
  | 'STOPPING'
  | 'STOPPED'
  | 'ERROR'
  | 'DEGRADED';

export type ProviderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'PRIMARY' | 'FALLBACK';

export type ProviderHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';

export interface ProviderMetadata {
  id: string;
  name: string;
  version: string;
  type: ProviderType;
  priority: number;
  enabled: boolean;
  status: ProviderStatus;
  description?: string;
}

export interface ProviderHealth {
  providerId: string;
  status: ProviderHealthStatus;
  lastCheckedAt: number;
  latencyMs?: number;
  details?: Record<string, unknown>;
}
