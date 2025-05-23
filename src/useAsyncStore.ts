import { useCallback } from 'react';

import { type AsyncStore } from './types';
import { useAsyncStoreState } from './useAsyncStoreState';

export function useAsyncStore<T>(store: AsyncStore<T>) {
  const state = useAsyncStoreState(store);

  const setState = useCallback(
    (nextState: T) => {
      store.next(nextState);
    },
    [store],
  );

  const reload = useCallback(() => {
    return store.load(true);
  }, [store]);

  return [state, setState, reload] as const;
}
