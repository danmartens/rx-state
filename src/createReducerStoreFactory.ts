import {
  Action,
  Effect,
  ReducerStoreFactory,
  ReducerStoreOptions,
} from './types';
import { createReducerStore } from './createReducerStore';

export function createReducerStoreFactory<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
>(
  reducer: (state: TState, action: TAction) => TState,
  effects: Effect<TState, TAction, TDependencies>[] = [],
  options: ReducerStoreOptions<TState, TAction> = {}
): ReducerStoreFactory<TState, TAction, TDependencies> {
  return (initialValue: TState, dependencies: TDependencies) => {
    return createReducerStore(
      initialValue,
      dependencies,
      reducer,
      effects,
      options
    );
  };
}
