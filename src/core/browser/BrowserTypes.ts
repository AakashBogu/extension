export interface TabInfo {
  id: number;
  url: string;
  title?: string;
  active: boolean;
  windowId: number;
  status?: string;
}

export interface WindowInfo {
  id: number;
  focused: boolean;
  type?: string;
  tabsCount?: number;
}

export interface PageLifecycleState {
  visibility: 'visible' | 'hidden';
  focus: 'focused' | 'blurred';
  lastNavigatedAt: number;
  url: string;
  origin: string;
  domain: string;
}

export interface PermissionStatusMap {
  tabCapture: boolean;
  offscreen: boolean;
  activeTab: boolean;
  storage: boolean;
  microphone?: boolean;
}
