import { describe, it, expect, beforeEach } from 'vitest';
import { NavigationManager } from '../core/browser/NavigationManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2A: NavigationManager', () => {
  let navManager: NavigationManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    navManager = new NavigationManager(eventBus);
  });

  it('should process normal and SPA navigations cleanly', () => {
    let urlChanged = false;
    eventBus.subscribe('url.changed', () => { urlChanged = true; });

    navManager.handleNavigation('https://www.youtube.com/watch?v=abc1234', true);
    const state = navManager.getPageState();

    expect(state.origin).toBe('https://www.youtube.com');
    expect(state.domain).toBe('www.youtube.com');
    expect(urlChanged).toBe(true);
  });

  it('should handle page visibility and focus state changes', () => {
    navManager.handleVisibilityChange('hidden');
    expect(navManager.getPageState().visibility).toBe('hidden');

    navManager.handleFocusChange('blurred');
    expect(navManager.getPageState().focus).toBe('blurred');
  });
});
