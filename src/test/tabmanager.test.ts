import { describe, it, expect, beforeEach } from 'vitest';
import { TabManager } from '../core/browser/TabManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2A: TabManager', () => {
  let tabManager: TabManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    tabManager = new TabManager(eventBus);
  });

  it('should track tab creation, activation, and removal', () => {
    tabManager.handleTabCreated({ id: 101, url: 'https://youtube.com/watch?v=demo', active: true, windowId: 1 });
    expect(tabManager.getActiveTab()?.id).toBe(101);

    tabManager.handleTabCreated({ id: 102, url: 'https://vimeo.com/12345', active: false, windowId: 1 });
    tabManager.handleTabActivated({ tabId: 102, windowId: 1 });

    expect(tabManager.getActiveTab()?.id).toBe(102);

    tabManager.handleTabRemoved(102);
    expect(tabManager.getActiveTab()).toBeUndefined();
  });
});
