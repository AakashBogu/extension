import { BrowserIntegrationManager } from './BrowserIntegrationManager';

export class DeveloperValidationHarness {
  constructor(private integrationManager: BrowserIntegrationManager) {}

  validateSite(siteName: string): { site: string; success: boolean; activeVideoId: string | null; discoveredCount: number } {
    const pipeline = this.integrationManager.getPipelineStatus();
    return {
      site: siteName,
      success: pipeline.isInitialized,
      activeVideoId: pipeline.activeVideoId,
      discoveredCount: pipeline.discoveredVideosCount
    };
  }
}
