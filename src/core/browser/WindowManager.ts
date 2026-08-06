import { WindowInfo } from './BrowserTypes';
import { IEventBus } from '../events/IEventBus';
import { WindowError } from '../error/BrowserRuntimeErrors';

export class WindowManager {
  private windows = new Map<number, WindowInfo>();
  private activeWindowId: number | null = null;
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus;
    this.initializeChromeListeners();
  }

  handleWindowCreated(win: WindowInfo): void {
    this.windows.set(win.id, win);
    if (win.focused) {
      this.activeWindowId = win.id;
    }
    if (this.eventBus) {
      this.eventBus.publish('window.created', win);
    }
  }

  handleWindowRemoved(windowId: number): void {
    this.windows.delete(windowId);
    if (this.activeWindowId === windowId) {
      this.activeWindowId = null;
    }
    if (this.eventBus) {
      this.eventBus.publish('window.removed', { windowId });
    }
  }

  handleWindowFocused(windowId: number): void {
    this.activeWindowId = windowId;
    this.windows.forEach((win, id) => {
      win.focused = (id === windowId);
    });

    if (this.eventBus) {
      this.eventBus.publish('window.focused', { windowId });
    }
  }

  getActiveWindow(): WindowInfo | undefined {
    if (this.activeWindowId !== null) {
      return this.windows.get(this.activeWindowId);
    }
    return Array.from(this.windows.values()).find(w => w.focused);
  }

  getWindow(windowId: number): WindowInfo {
    const win = this.windows.get(windowId);
    if (!win) throw new WindowError(windowId, 'Window not found');
    return win;
  }

  listWindows(): WindowInfo[] {
    return Array.from(this.windows.values());
  }

  private initializeChromeListeners(): void {
    if (typeof chrome !== 'undefined' && chrome.windows) {
      chrome.windows.onCreated.addListener(win => {
        if (win.id) this.handleWindowCreated({ id: win.id, focused: !!win.focused, type: win.type });
      });
      chrome.windows.onRemoved.addListener(windowId => {
        this.handleWindowRemoved(windowId);
      });
      chrome.windows.onFocusChanged.addListener(windowId => {
        if (windowId !== chrome.windows.WINDOW_ID_NONE) {
          this.handleWindowFocused(windowId);
        }
      });
    }
  }
}
