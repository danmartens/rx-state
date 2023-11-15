import { useCallback, useSyncExternalStore } from 'react';

import { type AsyncStore } from './types';

export function useAsyncStoreState<T>(store: AsyncStore<T>): T {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const subscription = store.subscribe(onChange);

      return () => {
        subscription.unsubscribe();
      };
    },
    [store]
  );

  const getValue = useCallback((): T => {
    const value = store.getValue();

    if (value === undefined) {
      throw store.load();
    }

    return value.orThrow();
  }, [store]);

  return useSyncExternalStore(subscribe, getValue, getValue);
}
