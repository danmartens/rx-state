import {
  BehaviorSubject,
  Subscription,
  distinctUntilChanged,
  finalize,
  from,
} from 'rxjs';

import { diffObjects } from './utils/diffObjects';
import { formatChangeset } from './utils/formatChangeset';
import { isRecord } from './utils/isRecord';
import { Store, StoreOptions, StoreStatus } from './types';

export function createStore<TState>(
  initialState: TState,
  options: StoreOptions<TState> = {}
): Store<TState> {
  const { get, set, logging } = options;

  const state$ = new BehaviorSubject(initialState);
  const distinctState$ = state$.pipe(distinctUntilChanged());

  let status = get != null ? StoreStatus.Initial : StoreStatus.HasValue;

  let getPromise: Promise<TState> | null = null;
  let getSubscription: Subscription | null = null;
  let getError: Error | null = null;

  let setSubscription: Subscription | null = null;

  let subscriptionCount = 0;

  const logState = (state: TState, nextState: TState) => {
    if (process.env.NODE_ENV !== 'production' && logging?.state != null) {
      if (
        state !== nextState &&
        ((typeof logging.state === 'function' && logging.state(nextState)) ||
          logging.state === true)
      ) {
        if (isRecord(state) && isRecord(nextState)) {
          console.log(formatChangeset(diffObjects(state, nextState)));
        } else {
          console.log(`State (${logging.name}): ${state} => ${nextState}`);
        }
      }
    }
  };

  const setStatus = (nextStatus: StoreStatus) => {
    if (nextStatus !== status && logging?.status) {
      console.log(`Status (${logging.name}): ${nextStatus}`);
    }

    status = nextStatus;
  };

  const next = (state: TState) => {
    logState(state$.getValue(), state);

    state$.next(state);
  };

  const load = (): Promise<TState> => {
    if (getPromise != null && status !== StoreStatus.Initial) {
      return getPromise;
    }

    if (get == null) {
      getPromise = Promise.resolve(state$.getValue());

      setStatus(StoreStatus.HasValue);
    } else {
      const promiseOrValue = get();

      if (promiseOrValue instanceof Promise) {
        getPromise = promiseOrValue;

        setStatus(StoreStatus.Loading);

        getSubscription = from(promiseOrValue).subscribe({
          next: (value) => {
            status = StoreStatus.HasValue;

            next(value);
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

        setStatus(StoreStatus.HasValue);
        next(promiseOrValue);
      }
    }

    return getPromise;
  };

  return {
    next: (value) => {
      getSubscription?.unsubscribe();
      setSubscription?.unsubscribe();

      getSubscription = null;
      setSubscription = null;

      setStatus(StoreStatus.HasValue);
      next(value);

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
    subscribe: (observer) => {
      if (subscriptionCount === 0) {
        load();
      }

      subscriptionCount++;

      return distinctState$
        .pipe(
          finalize(() => {
            subscriptionCount--;

            if (subscriptionCount === 0) {
              if (status === StoreStatus.Loading) {
                setStatus(StoreStatus.Initial);
              }

              getSubscription?.unsubscribe();
              setSubscription?.unsubscribe();

              getSubscription = null;
              setSubscription = null;
            }
          })
        )
        .subscribe(observer);
    },
    getStatus: () => status,
    getError: () => getError,
    getValue: () => state$.getValue(),
    load,
  };
}
