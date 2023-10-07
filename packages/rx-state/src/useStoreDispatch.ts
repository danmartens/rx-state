import { useCallback } from 'react';

import { Action, ReducerStore } from './types';

export const useStoreDispatch = <TState, TAction extends Action>(
  store: ReducerStore<TState, TAction>
) => {
  return useCallback(
    (action: TAction) => {
      store.next(action);
    },
    [store]
  );
};
