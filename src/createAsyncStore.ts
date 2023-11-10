import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  filter,
  finalize,
  from,
  tap,
  type Subscription,
} from 'rxjs';

import type { AsyncStore, Getter, ObserverOrNext, Setter } from './types';
import { isDefined } from './utils/isDefined';

export function createAsyncStore<T>(
  get: Getter<T>,
  set?: Setter<T>
): AsyncStore<T> {
  const state$ = new BehaviorSubject<T | undefined>(undefined);
  const distinctState$ = state$.pipe(distinctUntilChanged());

  let getPromise: Promise<T> | null = null;

  let getSubscription: Subscription | null = null;
  let setSubscription: Subscription | null = null;

  let subscriptionCount = 0;

  const load = (force = false) => {
    if (!force && getPromise != null) {
      return getPromise;
    }

    getSubscription?.unsubscribe();

    const getResult = get();

    if (getResult instanceof Promise) {
      getPromise = getResult;
      getSubscription = from(getResult).subscribe(state$);
    } else if (getResult instanceof Observable) {
      getPromise = new Promise((resolve, reject) => {
        getSubscription = getResult
          .pipe(
            tap({
              next: (value) => {
                resolve(value);
              },
              error: (error) => {
                reject(error);
              },
            })
          )
          .subscribe(state$);
      });
    } else {
      getPromise = Promise.resolve(getResult);

      state$.next(getResult);
    }

    return getPromise;
  };

  return {
    next: (value: T) => {
      getSubscription?.unsubscribe();
      setSubscription?.unsubscribe();

      getSubscription = null;
      setSubscription = null;

      state$.next(value);

      if (set != null) {
        const setResult = set(value);

        if (setResult instanceof Promise) {
          setSubscription = from(setResult)
            .pipe(filter(isDefined))
            .subscribe(state$);
        } else if (setResult instanceof Observable) {
          setSubscription = setResult.pipe(filter(isDefined)).subscribe(state$);
        } else if (setResult != null) {
          state$.next(setResult);
        }
      }
    },
    subscribe: (observerOrNext: ObserverOrNext<T>) => {
      if (subscriptionCount === 0) {
        load();
      }

      subscriptionCount++;

      return distinctState$
        .pipe(
          filter(isDefined),
          finalize(() => {
            subscriptionCount--;

            if (subscriptionCount === 0) {
              getSubscription?.unsubscribe();
              setSubscription?.unsubscribe();

              getSubscription = null;
              setSubscription = null;
            }
          })
        )
        .subscribe(observerOrNext);
    },
    getValue: () => {
      return state$.getValue();
    },
    load,
  };
}
