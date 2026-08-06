import { StateValidationError } from '../error/StateKernelErrors';

export interface SliceMetadata {
  key: string;
  version: number;
  persistent: boolean;
}

export class StateRegistry {
  private slices = new Map<string, SliceMetadata>();

  registerSlice(key: string, metadata: Omit<SliceMetadata, 'key'>): void {
    if (this.slices.has(key)) {
      throw new StateValidationError(key, 'Slice key already registered');
    }
    this.slices.set(key, { key, ...metadata });
  }

  hasSlice(key: string): boolean {
    return this.slices.has(key);
  }

  getSliceMetadata(key: string): SliceMetadata | undefined {
    return this.slices.get(key);
  }

  listSlices(): SliceMetadata[] {
    return Array.from(this.slices.values());
  }
}
