import { TabInfo } from './BrowserTypes';
import { IEventBus } from '../events/IEventBus';
import { TabError } from '../error/BrowserRuntimeErrors';

export class TabManager {
  private tabs = new Map<number, TabInfo>();
  private activeTabId: number | null = null;
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus) {
    this.eventBus = eventBus;
    this.initializeChromeListeners();
  }

  handleTabCreated(tab: TabInfo): void {
    this.tabs.set(tab.id, tab);
    if (tab.active) {
      this.activeTabId = tab.id;
    }
    if (this.eventBus) {
      this.eventBus.publish('tab.created', tab);
    }
  }

  handleTabUpdated(tabId: number, changeInfo: Partial<TabInfo>): void {
    const existing = this.tabs.get(tabId);
    if (!existing) {
      const newTab: TabInfo = { id: tabId, url: changeInfo.url || '', active: false, windowId: 1, ...changeInfo };
      this.tabs.set(tabId, newTab);
      return;
    }

    const updated: TabInfo = { ...existing, ...changeInfo };
    this.tabs.set(tabId, updated);

    if (this.eventBus) {
      this.eventBus.publish('tab.updated', updated);
    }
  }

  handleTabActivated(activeInfo: { tabId: number; windowId: number }): void {
    this.activeTabId = activeInfo.tabId;
    this.tabs.forEach((tab, id) => {
      tab.active = (id === activeInfo.tabId);
    });

    if (this.eventBus) {
      this.eventBus.publish('tab.activated', activeInfo);
    }
  }

  handleTabRemoved(tabId: number): void {
    this.tabs.delete(tabId);
    if (this.activeTabId === tabId) {
      this.activeTabId = null;
    }
    if (this.eventBus) {
      this.eventBus.publish('tab.removed', { tabId });
    }
  }

  getActiveTab(): TabInfo | undefined {
    if (this.activeTabId !== null) {
      return this.tabs.get(this.activeTabId);
    }
    return Array.from(this.tabs.values()).find(t => t.active);
  }

  getTab(tabId: number): TabInfo {
    const tab = this.tabs.get(tabId);
    if (!tab) throw new TabError(tabId, 'Tab not found');
    return tab;
  }

  listTabs(): TabInfo[] {
    return Array.from(this.tabs.values());
  }

  private initializeChromeListeners(): void {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.onCreated.addListener(tab => {
        if (tab.id) this.handleTabCreated({ id: tab.id, url: tab.url || '', active: !!tab.active, windowId: tab.windowId || 1 });
      });
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        this.handleTabUpdated(tabId, { url: changeInfo.url || tab.url, title: tab.title, status: changeInfo.status });
      });
      chrome.tabs.onActivated.addListener(activeInfo => {
        this.handleTabActivated({ tabId: activeInfo.tabId, windowId: activeInfo.windowId });
      });
      chrome.tabs.onRemoved.addListener(tabId => {
        this.handleTabRemoved(tabId);
      });
    }
  }
}
