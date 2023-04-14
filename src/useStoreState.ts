import { useSyncExternalStore } from 'react';
import { Action, Store } from './types';

export const useStoreState = <TState, TAction extends Action>(
  store: Store<TState, TAction>
) => {
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
