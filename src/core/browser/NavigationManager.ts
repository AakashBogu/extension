import { PageLifecycleState } from './BrowserTypes';
import { IEventBus } from '../events/IEventBus';
import { NavigationError } from '../error/BrowserRuntimeErrors';

export class NavigationManager {
  private currentUrl: string = 'about:blank';
  private pageState: PageLifecycleState = {
    visibility: 'visible',
    focus: 'focused',
    lastNavigatedAt: Date.now(),
    url: 'about:blank',
    origin: 'null',
    domain: 'localhost'
  };
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus;
    this.initializeDomListeners();
  }

  handleNavigation(newUrl: string, isSpa: boolean = false): void {
    if (!newUrl) throw new NavigationError(newUrl, 'URL cannot be empty');

    const oldUrl = this.currentUrl;
    this.currentUrl = newUrl;

    let origin = 'null';
    let domain = 'localhost';
    try {
      const parsed = new URL(newUrl);
      origin = parsed.origin;
      domain = parsed.hostname;
    } catch (_err) {
      // Fallback for custom or relative URLs
    }

    this.pageState = {
      ...this.pageState,
      url: newUrl,
      origin,
      domain,
      lastNavigatedAt: Date.now()
    };

    if (this.eventBus) {
      this.eventBus.publish('navigation.started', { oldUrl, newUrl, isSpa });
      this.eventBus.publish('url.changed', { url: newUrl, origin, domain, isSpa });
      this.eventBus.publish('navigation.completed', { url: newUrl, isSpa });
    }
  }

  handleVisibilityChange(visibility: 'visible' | 'hidden'): void {
    this.pageState.visibility = visibility;
    if (this.eventBus) {
      this.eventBus.publish(visibility === 'visible' ? 'page.visible' : 'page.hidden', { timestamp: Date.now() });
    }
  }

  handleFocusChange(focus: 'focused' | 'blurred'): void {
    this.pageState.focus = focus;
    if (this.eventBus) {
      this.eventBus.publish(focus === 'focused' ? 'page.focused' : 'page.blurred', { timestamp: Date.now() });
    }
  }

  getPageState(): PageLifecycleState {
    return { ...this.pageState };
  }

  getCurrentUrl(): string {
    return this.currentUrl;
  }

  private initializeDomListeners(): void {
    if (typeof window !== 'undefined') {
      this.currentUrl = window.location.href;

      window.addEventListener('popstate', () => {
        this.handleNavigation(window.location.href, true);
      });

      document.addEventListener('visibilitychange', () => {
        this.handleVisibilityChange(document.hidden ? 'hidden' : 'visible');
      });

      window.addEventListener('focus', () => this.handleFocusChange('focused'));
      window.addEventListener('blur', () => this.handleFocusChange('blurred'));
    }
  }
}
