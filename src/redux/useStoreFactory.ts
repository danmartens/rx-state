import { useState } from 'react';
import { Action, StoreFactory, ReducerStoreFactory } from './types';
import { useStore } from './useStore';

export function useStoreFactory<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
>(
  storeFactory: StoreFactory<TState>,
  initialState: TState,
  dependencies?: TDependencies
): [TState, (state: TState) => void];

export function useStoreFactory<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
>(
  store: ReducerStoreFactory<TState, TAction>,
  initialState: TState,
  dependencies: TDependencies
): [TState, (action: TAction) => void];

export function useStoreFactory<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
>(
  storeFactory: StoreFactory<TState> | ReducerStoreFactory<TState, TAction>,
  initialState: TState,
  dependencies: TDependencies
) {
  const [store] = useState(() => storeFactory(initialState, dependencies));

  // @ts-expect-error
  return useStore(store);
}
