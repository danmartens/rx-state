import { Action, ReducerStoreFactory } from './types';
import { createReducerStore } from './createReducerStore';

export function createReducerStoreFactory<TState, TAction extends Action>(
  reducer: (state: TState, action: TAction) => TState
): ReducerStoreFactory<TState, TAction> {
  return (initialValue: TState) => {
    return createReducerStore(initialValue, reducer);
  };
}
