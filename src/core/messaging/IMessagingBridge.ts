import { BaseEvent } from '../events/EventTypes';

export type MessageHandler = (message: BaseEvent, senderContext: string) => void | Promise<void>;

export interface IMessagingBridge {
  sendMessage(targetContext: string, event: BaseEvent): Promise<unknown>;
  sendTabMessage(tabId: number, event: BaseEvent): Promise<unknown>;
  onMessage(handler: MessageHandler): () => void;
  serialize<T>(payload: T): string;
  deserialize<T>(jsonStr: string): T;
}
