export class TabCapturePermissionManager {
  async checkPermissions(): Promise<{ tabCapture: boolean; activeTab: boolean; storage: boolean }> {
    if (typeof chrome !== 'undefined' && chrome.permissions) {
      return new Promise(resolve => {
        chrome.permissions.getAll(perms => {
          resolve({
            tabCapture: perms.permissions?.includes('tabCapture') || false,
            activeTab: perms.permissions?.includes('activeTab') || false,
            storage: perms.permissions?.includes('storage') || false
          });
        });
      });
    }

    return { tabCapture: true, activeTab: true, storage: true };
  }
}
