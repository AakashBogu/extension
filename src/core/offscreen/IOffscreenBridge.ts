import { OffscreenMessage, OffscreenMessageType } from './OffscreenRuntimeTypes';

export type OffscreenMessageHandler = (message: OffscreenMessage) => void;

export interface IOffscreenBridge {
  send(message: OffscreenMessage): Promise<void>;
  request<TRes = unknown>(message: OffscreenMessage): Promise<TRes>;
  subscribe(type: OffscreenMessageType, handler: OffscreenMessageHandler): void;
  unsubscribe(type: OffscreenMessageType, handler: OffscreenMessageHandler): void;
  isAvailable(): boolean;
  healthCheck(): Promise<boolean>;
}
