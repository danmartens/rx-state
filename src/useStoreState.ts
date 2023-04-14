import { useSyncExternalStore } from 'react';
import { Store } from './createStore';

export const useStoreState = <State, Action>(store: Store<State, Action>) => {
  return useSyncExternalStore((onChange) => {
    const subscription = store.subscribe({
      next: () => {
        onChange();
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, store.getState);
};
