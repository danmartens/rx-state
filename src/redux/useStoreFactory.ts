import { useState } from 'react';
import { Action, StoreFactory, ReducerStoreFactory } from './types';
import { useStore } from './useStore';

export function useStoreFactory<TState, TAction extends Action>(
  storeFactory: StoreFactory<TState>,
  initialState: TState
): [TState, (state: TState) => void];

export function useStoreFactory<TState, TAction extends Action>(
  store: ReducerStoreFactory<TState, TAction>,
  initialState: TState
): [TState, (action: TAction) => void];

export function useStoreFactory<TState, TAction extends Action>(
  storeFactory: StoreFactory<TState> | ReducerStoreFactory<TState, TAction>,
  initialState: TState
) {
  const [store] = useState(() => storeFactory(initialState));

  // @ts-expect-error
  return useStore(store);
}
