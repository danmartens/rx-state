import { Subject, Subscription, finalize } from 'rxjs';
import {
  Store,
  StoreStatus,
  ReducerStore,
  Getter,
  ReadonlyStore,
} from './types';

export function createSelector<TState>(
  callback: (get: Getter) => TState
): ReadonlyStore<TState> {
  let previousValue: TState;

  const subscriptions = new Map<
    Store<any> | ReducerStore<any, any> | ReadonlyStore<any>,
    Subscription
  >();

  const state$ = new Subject<TState>();

  let updating = false;

  const update = () => {
    updating = true;

    const value = callback((store) => {
      if (!subscriptions.has(store)) {
        subscriptions.set(
          store,
          store.subscribe(() => {
            if (updating) {
              return;
            }

            update();
          })
        );
      }

      return store.getValue();
    });

    if (value != previousValue) {
      state$.next(value);
    }

    updating = false;
    previousValue = value;
  };

  let subscriptionsCount = 0;
  let loadPromise: Promise<TState> | null = null;

  return {
    subscribe: (observerOrNext) => {
      const subscription = state$
        .pipe(
          finalize(() => {
            subscriptionsCount--;

            if (subscriptionsCount === 0) {
              for (const subscription of subscriptions.values()) {
                subscription.unsubscribe();
              }
            }
          })
        )
        .subscribe(observerOrNext);

      if (subscriptionsCount === 0) {
        update();
      }

      subscriptionsCount++;

      return subscription;
    },
    getValue: () => {
      return callback((store) => store.getValue());
    },
    getStatus: () => {
      const statuses = Array.from(subscriptions.keys()).map((store) =>
        store.getStatus()
      );

      if (statuses.length === 0) {
        return StoreStatus.Initial;
      }

      if (statuses.includes(StoreStatus.HasError)) {
        return StoreStatus.HasError;
      }

      if (statuses.includes(StoreStatus.Loading)) {
        return StoreStatus.Loading;
      }

      if (statuses.includes(StoreStatus.Initial)) {
        return StoreStatus.Initial;
      }

      return StoreStatus.HasValue;
    },
    getError: () => {
      for (const store of subscriptions.keys()) {
        const error = store.getError();

        if (error != null) {
          return error;
        }
      }

      return null;
    },
    load: () => {
      if (loadPromise != null) {
        return loadPromise;
      }

      update();

      const promises = Array.from(subscriptions.keys()).map((store) =>
        store.load()
      );

      loadPromise = Promise.all(promises).then(() => {
        return callback((store) => store.getValue());
      });

      return loadPromise;
    },
  };
}
