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

export interface Options<T> {
  logging?: {
    name: string;
    state?: boolean | ((state: T) => boolean);
    subscriptions?: boolean;
  };
}

export function createAsyncStore<T>(
  get: Getter<T>,
  set?: Setter<T>,
  options: Options<T> = {}
): AsyncStore<T> {
  const state$ = new BehaviorSubject<T | undefined>(undefined);
  const distinctState$ = state$.pipe(distinctUntilChanged());

  let getPromise: Promise<T> | null = null;

  let getSubscription: Subscription | null = null;
  let setSubscription: Subscription | null = null;

  let subscriptionCount = 0;

  const { logging } = options;

  const load = (force = false) => {
    if (!force && getPromise != null) {
      return getPromise;
    }

    getSubscription?.unsubscribe();

    const getResult = get();

    if (getResult instanceof Promise) {
      getPromise = getResult;

      getSubscription = from(getResult).subscribe({
        next: (value) => {
          state$.next(value);
        },
        error: (error) => {
          state$.error(error);
        },
      });
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
          .subscribe({
            next: (value) => {
              state$.next(value);
            },
            error: (error) => {
              state$.error(error);
            },
          });
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
            .subscribe({
              next: (value) => {
                state$.next(value);
              },
              error: (error) => {
                state$.error(error);
              },
            });
        } else if (setResult instanceof Observable) {
          setSubscription = setResult.pipe(filter(isDefined)).subscribe({
            next: (value) => {
              state$.next(value);
            },
            error: (error) => {
              state$.error(error);
            },
          });
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

      if (process.env.NODE_ENV !== 'production' && logging?.subscriptions) {
        console.log(`Subscribe (${logging.name})`, {
          subscriptionCount,
        });
      }

      return distinctState$
        .pipe(
          filter(isDefined),
          tap((state) => {
            if (
              process.env.NODE_ENV !== 'production' &&
              logging?.state != null
            ) {
              if (
                (typeof logging.state === 'function' && logging.state(state)) ||
                logging.state
              ) {
                console.log(`State (${logging.name})`, state);
              }
            }
          }),
          finalize(() => {
            subscriptionCount--;

            if (
              process.env.NODE_ENV !== 'production' &&
              logging?.subscriptions
            ) {
              console.log(`Unsubscribe (${logging.name})`, {
                subscriptionCount,
              });
            }

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
