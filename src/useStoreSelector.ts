import { useSyncExternalStore } from 'react';
import { Action, Store } from './types';

export const useStoreSelector = <TState, TAction extends Action, TSelected>(
  store: Store<TState, TAction>,
  selector: (state: TState) => TSelected
): TSelected => {
  return useSyncExternalStore(
    (onChange) => {
      const subscription = store.subscribe({
        next: () => {
          onChange();
        },
      });

      return () => {
        subscription.unsubscribe();
      };
    },
    () => selector(store.getState())
  );
};
