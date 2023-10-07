import { useSyncExternalStore } from 'react';

import { ReadonlyStore, StoreStatus } from './types';

export function useStoreState<TState>(store: ReadonlyStore<TState>) {
  if (
    store.getStatus() === StoreStatus.Initial ||
    store.getStatus() === StoreStatus.Loading
  ) {
    throw store.load();
  }

  if (store.getStatus() === StoreStatus.HasError) {
    const error = store.getError();

    if (error != null) {
      throw error;
    }

    throw new Error('Store encountered an error');
  }

  return useSyncExternalStore(
    (callback) => {
      const subscription = store.subscribe(callback);

      return () => {
        subscription.unsubscribe();
      };
    },
    store.getValue,
    store.getValue
  );
}
