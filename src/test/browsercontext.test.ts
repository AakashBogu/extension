import { describe, it, expect } from 'vitest';
import { RuntimeManager } from '../core/browser/RuntimeManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2A: BrowserContext & RuntimeManager', () => {
  it('should query permissions and assemble runtime context', async () => {
    const eventBus = new EventBus();
    const runtimeManager = new RuntimeManager(eventBus);

    runtimeManager.tabManager.handleTabCreated({ id: 1, url: 'https://youtube.com', active: true, windowId: 1 });
    runtimeManager.windowManager.handleWindowCreated({ id: 1, focused: true });

    const context = runtimeManager.browserContext;
    expect(context.getCurrentTab()?.url).toBe('https://youtube.com');
    expect(context.getCurrentWindow()?.id).toBe(1);

    const perms = await context.queryPermissions();
    expect(perms.tabCapture).toBe(true);
  });
});
