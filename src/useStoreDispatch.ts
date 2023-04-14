import { useCallback } from 'react';

import { Action, Store } from './types';

export const useStoreDispatch = <TState, TAction extends Action>(
  store: Store<TState, TAction>
) => {
  return useCallback(
    (action: TAction) => {
      store.next(action);
    },
    [store]
  );
};
