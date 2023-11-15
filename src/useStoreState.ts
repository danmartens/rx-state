import { useCallback, useSyncExternalStore } from 'react';
import { Action, Store } from './types';

export const useStoreState = <TState, TAction extends Action>(
  store: Store<TState, TAction>
) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const subscription = store.subscribe(onChange);

      return () => {
        subscription.unsubscribe();
      };
    },
    [store]
  );

  return useSyncExternalStore(subscribe, store.getState, store.getState);
};
