import { ProviderRequestCancelledError } from '../../error/ProviderExecutionErrors';
import { IEventBus } from '../../events/IEventBus';

export class ProviderRequestCancellationManager {
  private controllers = new Map<string, AbortController>();
  private cancelledIds = new Set<string>();

  constructor(private eventBus?: IEventBus) {}

  createController(requestId: string): AbortController {
    const controller = new AbortController();
    this.controllers.set(requestId, controller);
    return controller;
  }

  cancelRequest(requestId: string): boolean {
    const controller = this.controllers.get(requestId);
    if (!controller && !this.cancelledIds.has(requestId)) return false;

    this.cancelledIds.add(requestId);
    if (controller) {
      controller.abort();
    }

    if (this.eventBus) {
      this.eventBus.publish('provider.request_cancelled', { requestId, timestamp: Date.now() });
    }

    return true;
  }

  removeController(requestId: string): void {
    this.controllers.delete(requestId);
  }

  isCancelled(requestId: string): boolean {
    if (this.cancelledIds.has(requestId)) return true;
    const controller = this.controllers.get(requestId);
    return controller ? controller.signal.aborted : false;
  }

  checkCancelled(requestId: string): void {
    if (this.isCancelled(requestId)) {
      throw new ProviderRequestCancelledError(`Request [${requestId}] was cancelled`, { requestId });
    }
  }

  clear(): void {
    this.controllers.forEach(c => c.abort());
    this.controllers.clear();
    this.cancelledIds.clear();
  }
}
