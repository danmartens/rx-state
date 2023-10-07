import { useSyncExternalStore } from 'react';
import { ReadonlyStore } from './types';

export function useSelector<TState>(selector: ReadonlyStore<TState>) {
  return useSyncExternalStore(
    (callback) => {
      const subscription = selector.subscribe(callback);

      return () => {
        subscription.unsubscribe();
      };
    },
    selector.getValue,
    selector.getValue
  );
}
