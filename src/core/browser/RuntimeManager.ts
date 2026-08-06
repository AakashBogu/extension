import { TabManager } from './TabManager';
import { WindowManager } from './WindowManager';
import { NavigationManager } from './NavigationManager';
import { BrowserContext } from './BrowserContext';
import { IEventBus } from '../events/IEventBus';
import { GlobalStateStore } from '../state/GlobalStateStore';

export class RuntimeManager {
  public readonly tabManager: TabManager;
  public readonly windowManager: WindowManager;
  public readonly navigationManager: NavigationManager;
  public readonly browserContext: BrowserContext;

  constructor(eventBus?: IEventBus, stateStore?: GlobalStateStore) {
    this.tabManager = new TabManager(eventBus);
    this.windowManager = new WindowManager(eventBus);
    this.navigationManager = new NavigationManager(eventBus);
    this.browserContext = new BrowserContext(this.tabManager, this.windowManager, this.navigationManager);

    if (stateStore) {
      this.syncState(stateStore);
    }
  }

  private syncState(stateStore: GlobalStateStore): void {
    stateStore.setState({
      runtime: {
        version: '1.0.0',
        env: 'production',
        isRunning: true,
        startedAt: Date.now()
      }
    });
  }
}
