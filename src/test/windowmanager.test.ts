import { describe, it, expect, beforeEach } from 'vitest';
import { WindowManager } from '../core/browser/WindowManager';
import { EventBus } from '../core/events/EventBus';

describe('Module 2A: WindowManager', () => {
  let windowManager: WindowManager;

  beforeEach(() => {
    const eventBus = new EventBus();
    windowManager = new WindowManager(eventBus);
  });

  it('should track window creation and focus changes', () => {
    windowManager.handleWindowCreated({ id: 10, focused: true });
    expect(windowManager.getActiveWindow()?.id).toBe(10);

    windowManager.handleWindowCreated({ id: 20, focused: false });
    windowManager.handleWindowFocused(20);

    expect(windowManager.getActiveWindow()?.id).toBe(20);
  });
});
