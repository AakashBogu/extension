import { RuntimeManager } from './RuntimeManager';
import { IEventBus } from '../events/IEventBus';
import { GlobalStateStore } from '../state/GlobalStateStore';

export class BrowserRuntime {
  public readonly runtimeManager: RuntimeManager;

  constructor(eventBus?: IEventBus, stateStore?: GlobalStateStore) {
    this.runtimeManager = new RuntimeManager(eventBus, stateStore);
  }

  getContext() {
    return this.runtimeManager.browserContext;
  }
}
