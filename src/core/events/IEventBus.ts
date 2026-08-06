/**
 * Event Bus Interface (Module 1C Contract)
 */
import { BaseEvent, EventTopic } from './EventTypes';

export type EventHandler<T = unknown> = (event: BaseEvent<T>) => void | Promise<void>;

export interface IEventBus {
  publish<T>(topic: EventTopic, payload: T): Promise<void>;
  subscribe<T>(topic: EventTopic, handler: EventHandler<T>): () => void;
  unsubscribeAll(topic?: EventTopic): void;
}
