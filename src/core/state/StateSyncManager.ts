import { GlobalState } from './StateTypes';

export type StateSyncHandler = (stateDiff: Partial<GlobalState>, sourceContext: string) => void;

export class StateSyncManager {
  private syncHandlers = new Set<StateSyncHandler>();

  onSync(handler: StateSyncHandler): () => void {
    this.syncHandlers.add(handler);
    return () => this.syncHandlers.delete(handler);
  }

  broadcastSync(stateDiff: Partial<GlobalState>, sourceContext: string): void {
    this.syncHandlers.forEach(h => h(stateDiff, sourceContext));
  }
}
