import { useState } from 'react';

import type { Action, StoreFactory } from './types';

import { useStore } from './useStore';

export const useStoreFactory = <
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown>,
>(
  factory: StoreFactory<TState, TAction, TDependencies>,
  initialState: TState,
  dependencies: TDependencies,
) => {
  const [store] = useState(() => factory(initialState, dependencies));

  return useStore(store);
};
