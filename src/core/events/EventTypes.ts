/**
 * Event Types & Topic Definitions (Module 1C Contract)
 */
export type EventTopic =
  | 'audio.captured'
  | 'transcript.produced'
  | 'claim.detected'
  | 'verification.started'
  | 'verdict.ready'
  | 'cost.alert'
  | 'system.state_changed';

export interface BaseEvent<T = unknown> {
  id: string;
  topic: EventTopic;
  timestamp: number;
  payload: T;
}
