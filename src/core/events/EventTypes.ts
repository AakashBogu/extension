/**
 * Event Types & Topic Definitions (Module 3A Specification)
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
  | 'page.blurred'
  | 'video.discovered'
  | 'video.registered'
  | 'video.removed'
  | 'video.registry_updated'
  | 'video.scan_completed'
  | 'video.metadata_updated'
  | 'video.state_changed'
  | 'video.ready'
  | 'video.playing'
  | 'video.paused'
  | 'video.buffering'
  | 'video.waiting'
  | 'video.stalled'
  | 'video.ended'
  | 'video.destroyed'
  | 'video.error'
  | 'playback.started'
  | 'playback.updated'
  | 'playback.paused'
  | 'playback.seek_started'
  | 'playback.seek_completed'
  | 'playback.rate_changed'
  | 'playback.volume_changed'
  | 'playback.progress'
  | 'playback.buffering'
  | 'playback.resumed'
  | 'playback.ended'
  | 'playback.fullscreen_changed'
  | 'playback.pip_changed'
  | 'active_video.changed'
  | 'active_video.selected'
  | 'active_video.lost'
  | 'video.score_updated'
  | 'video.candidate_added'
  | 'video.candidate_removed'
  | 'browser_pipeline.ready'
  | 'browser_pipeline.error'
  | 'video_pipeline.ready'
  | 'video_pipeline.error'
  | 'health_check.completed'
  | 'resource_cleanup.completed'
  | 'compatibility_check.completed'
  | 'performance_report.ready'
  // Module 3A Offscreen Audio Runtime Topics
  | 'offscreen.creating'
  | 'offscreen.created'
  | 'offscreen.initializing'
  | 'offscreen.ready'
  | 'offscreen.started'
  | 'offscreen.stopped'
  | 'offscreen.suspended'
  | 'offscreen.resumed'
  | 'offscreen.destroyed'
  | 'offscreen.error'
  | 'offscreen.health_changed'
  | 'offscreen.heartbeat'
  | 'offscreen.recovery_started'
  | 'offscreen.recovery_completed'
  | 'offscreen.recovery_failed';

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
