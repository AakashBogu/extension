import { IStateManager, AppState } from './IAppState';
import { GlobalStateStore } from './GlobalStateStore';
import { IEventBus } from '../events/IEventBus';

export class StateManager implements IStateManager {
  private store: GlobalStateStore;
  private eventBus?: IEventBus;

  constructor(store: GlobalStateStore, eventBus?: IEventBus) {
    this.store = store;
    this.eventBus = eventBus;
  }

  getState(): AppState {
    return this.store.getState().application;
  }

  setState(partial: Partial<AppState>): void {
    const currentApp = this.store.getState().application;
    const nextApp: AppState = { ...currentApp, ...partial };

    this.store.setState({ application: nextApp });

    if (this.eventBus) {
      this.eventBus.publish('system.state_changed', nextApp.status);
    }
  }

  subscribe(listener: (state: AppState) => void): () => void {
    return this.store.subscribe((nextState) => {
      listener(nextState.application);
    });
  }

  getStore(): GlobalStateStore {
    return this.store;
  }
}
