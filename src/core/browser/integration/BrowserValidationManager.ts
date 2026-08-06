import { PipelineValidationError } from '../../error/BrowserIntegrationErrors';

export class BrowserValidationManager {
  validateActiveVideoUniqueness(activeVideoIds: (string | null)[]): boolean {
    const nonNull = activeVideoIds.filter(id => id !== null);
    if (nonNull.length > 1) {
      throw new PipelineValidationError('ActiveVideoUniqueness', 'More than one video is marked as active');
    }
    return true;
  }

  validateRegistryConsistency(discoveredCount: number, registryCount: number): boolean {
    if (registryCount < 0 || discoveredCount < 0) {
      throw new PipelineValidationError('RegistryConsistency', 'Negative video counts detected');
    }
    return true;
  }
}
