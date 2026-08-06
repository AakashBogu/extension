import { IMessagingBridge, MessageHandler } from './IMessagingBridge';
import { BaseEvent } from '../events/EventTypes';
import { MessageSerializationError } from '../error/EventErrors';

export class ChromeMessagingBridge implements IMessagingBridge {
  private handlers = new Set<MessageHandler>();

  constructor() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
        if (this.isBaseEvent(message)) {
          const contextName = sender.tab ? `tab:${sender.tab.id}` : 'background';
          this.notifyHandlers(message, contextName);
          sendResponse({ received: true });
        }
        return false;
      });
    }
  }

  async sendMessage(targetContext: string, event: BaseEvent): Promise<unknown> {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ targetContext, ...event }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
    }
    // Fallback for test / node context
    this.notifyHandlers(event, targetContext);
    return { received: true };
  }

  async sendTabMessage(tabId: number, event: BaseEvent): Promise<unknown> {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
      return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, event, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
    }
    this.notifyHandlers(event, `tab:${tabId}`);
    return { received: true };
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  serialize<T>(payload: T): string {
    try {
      return JSON.stringify(payload);
    } catch (err) {
      throw new MessageSerializationError(err instanceof Error ? err.message : String(err));
    }
  }

  deserialize<T>(jsonStr: string): T {
    try {
      return JSON.parse(jsonStr) as T;
    } catch (err) {
      throw new MessageSerializationError(err instanceof Error ? err.message : String(err));
    }
  }

  private notifyHandlers(event: BaseEvent, context: string): void {
    this.handlers.forEach(h => h(event, context));
  }

  private isBaseEvent(msg: unknown): msg is BaseEvent {
    return typeof msg === 'object' && msg !== null && 'topic' in msg && 'id' in msg;
  }
}
