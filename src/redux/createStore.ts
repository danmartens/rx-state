import { BehaviorSubject, Subscription, finalize, from } from 'rxjs';
import { Store, StoreStatus } from './types';

export function createStore<TState>(
  initialState: TState,
  get?: () => TState | Promise<TState>,
  set?: (value: TState) => Promise<TState> | TState | void
): Store<TState> {
  const state$ = new BehaviorSubject(initialState);

  let status = get != null ? StoreStatus.Initial : StoreStatus.HasValue;
  let subscriptionCount = 0;

  let getPromise: Promise<TState> | null = null;
  let getSubscription: Subscription | null = null;
  let getError: Error | null = null;

  let setSubscription: Subscription | null = null;

  const load = (): Promise<TState> => {
    if (getPromise != null && status !== StoreStatus.Initial) {
      return getPromise;
    }

    if (get == null) {
      getPromise = Promise.resolve(state$.getValue());
      status = StoreStatus.HasValue;
    } else {
      const promiseOrValue = get();

      if (promiseOrValue instanceof Promise) {
        getPromise = promiseOrValue;
        status = StoreStatus.Loading;

        getSubscription = from(promiseOrValue).subscribe({
          next: (value) => {
            status = StoreStatus.HasValue;

            if (value !== state$.getValue()) {
              state$.next(value);
            }
          },
          error: (error) => {
            if (status === StoreStatus.Loading) {
              status = StoreStatus.HasError;
              getError = error;
            }
          },
        });
      } else {
        getPromise = Promise.resolve(promiseOrValue);

        status = StoreStatus.HasValue;
        state$.next(promiseOrValue);
      }
    }

    return getPromise;
  };

  return {
    next(value) {
      getSubscription?.unsubscribe();
      setSubscription?.unsubscribe();

      status = StoreStatus.HasValue;

      state$.next(value);

      if (set != null) {
        const promiseOrValue = set(value);

        if (promiseOrValue instanceof Promise) {
          setSubscription = from(promiseOrValue).subscribe((value) => {
            // value$.next(value);
          });
        } else {
          // value$.next(promiseOrValue);
        }
      }
    },
    subscribe(observer) {
      if (subscriptionCount === 0) {
        load();
      }

      subscriptionCount++;

      return state$
        .pipe(
          finalize(() => {
            subscriptionCount--;

            if (subscriptionCount === 0) {
              if (status === StoreStatus.Loading) {
                status = StoreStatus.Initial;
              }

              getSubscription?.unsubscribe();
              setSubscription?.unsubscribe();
            }
          })
        )
        .subscribe(observer);
    },
    getStatus() {
      return status;
    },
    getError() {
      return getError;
    },
    getValue() {
      return state$.getValue();
    },
    load,
  };
}
