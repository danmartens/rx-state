import { StoreFactory } from './types';
import { createStore } from './createStore';

export function createStoreFactory<TState>(
  get?: () => TState | Promise<TState>,
  set?: (value: TState) => Promise<TState> | TState | void
): StoreFactory<TState> {
  return (initialValue: TState) => {
    return createStore(initialValue, get, set);
  };
}
