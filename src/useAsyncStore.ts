import { useSyncExternalStore, useCallback } from 'react';

import { type AsyncStore } from './types';

export function useAsyncStore<T>(store: AsyncStore<T>) {
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

  const state = useSyncExternalStore(subscribe, getValue, getValue);

  const setState = useCallback(
    (nextState: T) => {
      store.next(nextState);
    },
    [store]
  );

  const reload = useCallback(() => {
    return store.load(true);
  }, [store]);

  return [state, setState, reload] as const;
}
