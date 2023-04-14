import { useRef } from 'react';

import { Store } from './types';
import { useStore } from './useStore';

export const useStoreFactory = <State, Action>(
  factory: (initialState: State) => Store<State, Action>,
  initialState: State
) => {
  const store = useRef(factory(initialState)).current;

  return useStore(store);
};
