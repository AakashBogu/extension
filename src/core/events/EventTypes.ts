/**
 * Event Types & Topic Definitions (Module 2A Specification)
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
  | 'system.diagnostic'
  // Module 2A Browser Runtime Topics
  | 'tab.created'
  | 'tab.updated'
  | 'tab.removed'
  | 'tab.activated'
  | 'window.created'
  | 'window.removed'
  | 'window.focused'
  | 'navigation.started'
  | 'navigation.completed'
  | 'url.changed'
  | 'page.visible'
  | 'page.hidden'
  | 'page.focused'
  | 'page.blurred';

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
