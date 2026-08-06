import { GlobalState, StateSnapshot, StateDiff } from './StateTypes';
import { SnapshotError } from '../error/StateKernelErrors';

export type StateListener = (state: GlobalState, prevState: GlobalState) => void;
export type Selector<R> = (state: GlobalState) => R;

export class GlobalStateStore {
  private state: GlobalState;
  private version = 1;
  private listeners = new Set<StateListener>();
  private selectorCache = new Map<Selector<unknown>, { lastState: GlobalState; result: unknown }>();

  constructor(initialState: GlobalState) {
    this.state = Object.freeze(JSON.parse(JSON.stringify(initialState)));
  }

  getState(): GlobalState {
    return this.state;
  }

  getVersion(): number {
    return this.version;
  }

  setState(partial: Partial<GlobalState> | ((current: GlobalState) => Partial<GlobalState>)): void {
    const prevState = this.state;
    const updates = typeof partial === 'function' ? partial(prevState) : partial;

    const nextState: GlobalState = Object.freeze({
      ...prevState,
      ...updates
    });

    this.state = nextState;
    this.version++;

    this.notifyListeners(nextState, prevState);
  }

  select<R>(selector: Selector<R>): R {
    const untypedSelector = selector as Selector<unknown>;
    const cached = this.selectorCache.get(untypedSelector);
    if (cached && cached.lastState === this.state) {
      return cached.result as R;
    }

    const result = selector(this.state);
    this.selectorCache.set(untypedSelector, { lastState: this.state, result });
    return result;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeSelector<R>(selector: Selector<R>, listener: (selected: R, prevSelected: R) => void): () => void {
    let lastSelected = selector(this.state);

    return this.subscribe((nextState, _prevState) => {
      const currentSelected = selector(nextState);
      if (currentSelected !== lastSelected) {
        const prev = lastSelected;
        lastSelected = currentSelected;
        listener(currentSelected, prev);
      }
    });
  }

  createSnapshot(): StateSnapshot {
    return {
      id: `snap_${Date.now()}_${this.version}`,
      timestamp: Date.now(),
      version: this.version,
      state: JSON.parse(JSON.stringify(this.state))
    };
  }

  restoreSnapshot(snapshot: StateSnapshot): void {
    if (!snapshot || !snapshot.state) {
      throw new SnapshotError('Invalid snapshot object provided');
    }
    const prevState = this.state;
    this.state = Object.freeze(JSON.parse(JSON.stringify(snapshot.state)));
    this.version = snapshot.version;
    this.notifyListeners(this.state, prevState);
  }

  compareSnapshots(s1: StateSnapshot, s2: StateSnapshot): StateDiff {
    const changedKeys: string[] = [];
    const keys = new Set([...Object.keys(s1.state), ...Object.keys(s2.state)]);
    const state1 = s1.state as unknown as Record<string, unknown>;
    const state2 = s2.state as unknown as Record<string, unknown>;

    keys.forEach(k => {
      if (JSON.stringify(state1[k]) !== JSON.stringify(state2[k])) {
        changedKeys.push(k);
      }
    });

    return {
      changedKeys,
      oldState: s1.state,
      newState: s2.state
    };
  }

  private notifyListeners(nextState: GlobalState, prevState: GlobalState): void {
    this.listeners.forEach(listener => {
      try {
        listener(nextState, prevState);
      } catch (_ignored) {
        // Observer error isolation
      }
    });
  }
}
