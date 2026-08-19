import { ProviderHealthStatus } from '../ProviderTypes';

export type ExecutionEngineStatus =
  | 'IDLE'
  | 'INITIALIZING'
  | 'READY'
  | 'RUNNING'
  | 'RETRYING'
  | 'FALLING_BACK'
  | 'CANCELLING'
  | 'STOPPING'
  | 'COMPLETED'
  | 'FAILED'
  | 'STOPPED'
  | 'DESTROYED';

export type RequestLifecycleState =
  | 'CREATED'
  | 'QUEUED'
  | 'ROUTING'
  | 'EXECUTING'
  | 'RETRYING'
  | 'FALLBACK'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMED_OUT';

export interface ProviderRequestStatus {
  requestId: string;
  requestType: 'AI' | 'SEARCH';
  state: RequestLifecycleState;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  providerId?: string;
  attemptCount: number;
  timeoutMs: number;
  cancelled: boolean;
  error?: string;
}

export interface ProviderExecutionMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cancelledRequests: number;
  timedOutRequests: number;
  retryAttempts: number;
  fallbackAttempts: number;
  averageLatencyMs: number;
  maxLatencyMs: number;
  activeRequests: number;
  peakConcurrentRequests: number;
}

export interface ProviderExecutionHealth {
  status: ProviderHealthStatus;
  activeRequests: number;
  failureRate: number;
  lastCheckedAt: number;
}
