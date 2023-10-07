import { StoreFactory, StoreOptions } from './types';
import { createStore } from './createStore';

export function createStoreFactory<TState>(
  options?: StoreOptions<TState>
): StoreFactory<TState> {
  return (initialValue: TState) => {
    return createStore(initialValue, options);
  };
}
