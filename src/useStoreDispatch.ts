import { useCallback } from 'react';
import { Store } from './types';

export const useStoreDispatch = <State, Action>(
  store: Store<State, Action>
) => {
  return useCallback(
    (action: Action) => {
      store.next(action);
    },
    [store]
  );
};
