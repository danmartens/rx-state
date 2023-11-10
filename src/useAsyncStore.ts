import { useSyncExternalStore, useCallback } from 'react';

import { type AsyncStore } from './types';
import { type Defined } from './utils/isDefined';

export function useAsyncStore<T>(store: AsyncStore<T>) {
  const getValue = () => {
    const value = store.getValue();

    if (value === undefined) {
      throw store.load();
    }

    return value as Defined<T>;
  };

  const state = useSyncExternalStore(
    (callback) => {
      const subscription = store.subscribe({
        next: callback,
      });

      return () => {
        subscription.unsubscribe();
      };
    },
    getValue,
    getValue
  );

  const setState = (nextState: T) => {
    store.next(nextState);
  };

  const reload = useCallback(() => {
    return store.load(true);
  }, [store]);

  return [state, setState, reload] as const;
}
