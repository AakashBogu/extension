import { TabInfo, WindowInfo, PageLifecycleState, PermissionStatusMap } from './BrowserTypes';
import { TabManager } from './TabManager';
import { WindowManager } from './WindowManager';
import { NavigationManager } from './NavigationManager';

export class BrowserContext {
  constructor(
    private tabManager: TabManager,
    private windowManager: WindowManager,
    private navigationManager: NavigationManager
  ) {}

  getCurrentTab(): TabInfo | undefined {
    return this.tabManager.getActiveTab();
  }

  getCurrentWindow(): WindowInfo | undefined {
    return this.windowManager.getActiveWindow();
  }

  getPageState(): PageLifecycleState {
    return this.navigationManager.getPageState();
  }

  getOrigin(): string {
    return this.navigationManager.getPageState().origin;
  }

  getDomain(): string {
    return this.navigationManager.getPageState().domain;
  }

  async queryPermissions(): Promise<PermissionStatusMap> {
    if (typeof chrome !== 'undefined' && chrome.permissions) {
      return new Promise(resolve => {
        chrome.permissions.getAll(permissions => {
          resolve({
            tabCapture: permissions.permissions?.includes('tabCapture') || false,
            offscreen: permissions.permissions?.includes('offscreen') || false,
            activeTab: permissions.permissions?.includes('activeTab') || false,
            storage: permissions.permissions?.includes('storage') || false
          });
        });
      });
    }

    // Default test permissions
    return {
      tabCapture: true,
      offscreen: true,
      activeTab: true,
      storage: true,
      microphone: true
    };
  }
}
