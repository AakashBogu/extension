import { TabCaptureCapabilityManager } from './TabCaptureCapabilityManager';
import { TabCapturePermissionManager } from './TabCapturePermissionManager';
import { TabCaptureCapabilities } from './TabAudioCaptureTypes';

export class TabAudioCaptureHarness {
  constructor(
    private capabilityManager: TabCaptureCapabilityManager,
    private permissionManager: TabCapturePermissionManager
  ) {}

  async runDiagnosticHarness(): Promise<{ capabilities: TabCaptureCapabilities; permissions: { tabCapture: boolean; activeTab: boolean; storage: boolean }; readyForCapture: boolean }> {
    const capabilities = this.capabilityManager.detectCapabilities();
    const permissions = await this.permissionManager.checkPermissions();

    return {
      capabilities,
      permissions,
      readyForCapture: capabilities.tabCaptureApiAvailable && permissions.tabCapture
    };
  }
}
