/**
 * Event Types & Topic Definitions (Module 1C Specification)
 */
export type EventTopic =
  | 'audio.captured'
  | 'transcript.produced'
  | 'claim.detected'
  | 'verification.started'
  | 'verdict.ready'
  | 'cost.alert'
  | 'system.state_changed'
  | 'system.app_started'
  | 'system.app_stopped'
  | 'system.module_loaded'
  | 'system.plugin_loaded'
  | 'system.plugin_started'
  | 'system.plugin_stopped'
  | 'system.service_registered'
  | 'system.config_changed'
  | 'system.error_occurred'
  | 'system.diagnostic';

export type EventPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface EventMetadata {
  priority?: EventPriority;
  cancelled?: boolean;
  correlationId?: string;
  source?: string;
  retryCount?: number;
}

export interface BaseEvent<T = unknown> {
  id: string;
  topic: EventTopic;
  timestamp: number;
  payload: T;
  metadata?: EventMetadata;
}
