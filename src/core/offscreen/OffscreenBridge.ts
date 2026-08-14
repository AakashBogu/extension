import { IOffscreenBridge, OffscreenMessageHandler } from './IOffscreenBridge';
import { OffscreenMessage, OffscreenMessageType } from './OffscreenRuntimeTypes';
import { OffscreenMessageError } from '../error/OffscreenRuntimeErrors';

export class OffscreenBridge implements IOffscreenBridge {
  private handlers = new Map<OffscreenMessageType, Set<OffscreenMessageHandler>>();
  private pendingRequests = new Map<string, { resolve: (val: unknown) => void; reject: (err: unknown) => void; timer: NodeJS.Timeout }>();
  private timeoutMs: number;

  constructor(timeoutMs: number = 5000) {
    this.timeoutMs = timeoutMs;
    this.setupChromeListener();
  }

  isAvailable(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.runtime;
  }

  async send(message: OffscreenMessage): Promise<void> {
    if (!this.isAvailable()) {
      // In non-chrome mock environment, route internally
      this.dispatchInternal(message);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (_response) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(new OffscreenMessageError(message.messageId, err.message || 'Unknown Chrome runtime error'));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(new OffscreenMessageError(message.messageId, String(err)));
      }
    });
  }

  async request<TRes = unknown>(message: OffscreenMessage): Promise<TRes> {
    return new Promise<TRes>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(message.correlationId);
        reject(new OffscreenMessageError(message.messageId, 'Request timeout'));
      }, this.timeoutMs);

      this.pendingRequests.set(message.correlationId, { resolve: resolve as (val: unknown) => void, reject, timer });

      this.send(message).catch(err => {
        clearTimeout(timer);
        this.pendingRequests.delete(message.correlationId);
        reject(err);
      });
    });
  }

  subscribe(type: OffscreenMessageType, handler: OffscreenMessageHandler): void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler);
  }

  unsubscribe(type: OffscreenMessageType, handler: OffscreenMessageHandler): void {
    const set = this.handlers.get(type);
    if (set) {
      set.delete(handler);
    }
  }

  async healthCheck(): Promise<boolean> {
    const correlationId = `ping_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const pingMsg: OffscreenMessage = {
      messageId: correlationId,
      type: 'OFFSCREEN_HEARTBEAT',
      timestamp: Date.now(),
      source: 'service-worker',
      target: 'offscreen-document',
      correlationId,
      payload: {},
      version: '1.0.0'
    };

    try {
      await this.send(pingMsg);
      return true;
    } catch (_err) {
      return false;
    }
  }

  private setupChromeListener(): void {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message: OffscreenMessage, _sender, sendResponse) => {
        if (message && message.type) {
          this.dispatchInternal(message);
          sendResponse({ received: true });
        }
        return true;
      });
    }
  }

  private dispatchInternal(message: OffscreenMessage): void {
    // Check pending request correlation
    if (message.correlationId && this.pendingRequests.has(message.correlationId)) {
      const { resolve, timer } = this.pendingRequests.get(message.correlationId)!;
      clearTimeout(timer);
      this.pendingRequests.delete(message.correlationId);
      resolve(message.payload);
    }

    // Trigger handlers
    const set = this.handlers.get(message.type);
    if (set) {
      set.forEach(fn => fn(message));
    }
  }
}
