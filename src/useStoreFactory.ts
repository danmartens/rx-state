import { useRef } from 'react';

import { Action, Store } from './types';
import { useStore } from './useStore';

export const useStoreFactory = <TState, TAction extends Action>(
  factory: (initialState: TState) => Store<TState, TAction>,
  initialState: TState
) => {
  const store = useRef(factory(initialState)).current;

  return useStore(store);
};
