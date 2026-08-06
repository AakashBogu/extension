/**
 * Application State Infrastructure Contract
 */
export type ServiceStatus = 'IDLE' | 'CAPTURING' | 'TRANSCRIBING' | 'VERIFYING' | 'PAUSED' | 'ERROR';

export interface AppState {
  status: ServiceStatus;
  activeVideoId: string | null;
  activeTabId: number | null;
  claimsProcessedCount: number;
  lastError: string | null;
}

export interface IStateManager {
  getState(): AppState;
  setState(partial: Partial<AppState>): void;
  subscribe(listener: (state: AppState) => void): () => void;
}
