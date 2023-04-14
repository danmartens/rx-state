import { useSyncExternalStore } from 'react';
import { Store } from './types';

export const useStoreSelector = <State, Action, Selected>(
  store: Store<State, Action>,
  selector: (state: State) => Selected
): Selected => {
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
