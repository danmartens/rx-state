import { useCallback, useSyncExternalStore } from 'react';

import { Action, Store } from './types';

export const useStoreSelector = <TState, TAction extends Action, TSelected>(
  store: Store<TState, TAction>,
  selector: (state: TState) => TSelected
): TSelected => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const subscription = store.subscribe({
        next: () => {
          onChange();
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    },
    [store]
  );

  return useSyncExternalStore(subscribe, () => selector(store.getState()));
};
