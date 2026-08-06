import { GlobalState } from './StateTypes';
import { PersistenceError, HydrationError } from '../error/StateKernelErrors';

export interface IStatePersistenceAdapter {
  saveState(state: GlobalState): Promise<void>;
  loadState(): Promise<Partial<GlobalState> | null>;
  clearState(): Promise<void>;
}

export class MemoryStatePersistenceAdapter implements IStatePersistenceAdapter {
  private storage: string | null = null;

  async saveState(state: GlobalState): Promise<void> {
    try {
      this.storage = JSON.stringify(state);
    } catch (err) {
      throw new PersistenceError(err instanceof Error ? err.message : String(err));
    }
  }

  async loadState(): Promise<Partial<GlobalState> | null> {
    if (!this.storage) return null;
    try {
      return JSON.parse(this.storage) as Partial<GlobalState>;
    } catch (err) {
      throw new HydrationError(err instanceof Error ? err.message : String(err));
    }
  }

  async clearState(): Promise<void> {
    this.storage = null;
  }
}

export class StatePersistenceManager {
  private adapter: IStatePersistenceAdapter;

  constructor(adapter?: IStatePersistenceAdapter) {
    this.adapter = adapter || new MemoryStatePersistenceAdapter();
  }

  async persist(state: GlobalState): Promise<void> {
    await this.adapter.saveState(state);
  }

  async hydrate(): Promise<Partial<GlobalState> | null> {
    return await this.adapter.loadState();
  }
}
