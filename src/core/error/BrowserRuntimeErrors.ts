import { AppError } from './AppError';

export class BrowserRuntimeError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ERR_BROWSER_RUNTIME', details);
    this.name = 'BrowserRuntimeError';
  }
}

export class NavigationError extends AppError {
  constructor(url: string, reason: string) {
    super(`Navigation error for URL [${url}]: ${reason}`, 'ERR_NAVIGATION', { url, reason });
    this.name = 'NavigationError';
  }
}

export class ContextError extends AppError {
  constructor(reason: string) {
    super(`Browser context error: ${reason}`, 'ERR_BROWSER_CONTEXT');
    this.name = 'ContextError';
  }
}

export class TabError extends AppError {
  constructor(tabId: number, reason: string) {
    super(`Tab error for tabId [${tabId}]: ${reason}`, 'ERR_TAB', { tabId, reason });
    this.name = 'TabError';
  }
}

export class WindowError extends AppError {
  constructor(windowId: number, reason: string) {
    super(`Window error for windowId [${windowId}]: ${reason}`, 'ERR_WINDOW', { windowId, reason });
    this.name = 'WindowError';
  }
}
