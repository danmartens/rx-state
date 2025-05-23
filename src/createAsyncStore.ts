import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  filter,
  finalize,
  from,
  share,
  tap,
  type Subscription,
} from 'rxjs';

import { error, ok, toResult, type Result } from './result';
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
  options: Options<T> = {},
): AsyncStore<T> {
  const state$ = new BehaviorSubject<Result<T> | undefined>(undefined);

  const distinctState$ = state$.pipe(
    filter(isDefined),
    distinctUntilChanged((previous, current) => previous.equalTo(current)),
    tap((state) => {
      if (
        process.env.NODE_ENV !== 'production' &&
        logging?.state != null &&
        state.isOk()
      ) {
        if (
          (typeof logging.state === 'function' &&
            logging.state(state.valueOf())) ||
          logging.state
        ) {
          console.log(`State (${logging.name})`, state.valueOf());
        }
      }
    }),
    share(),
  );

  let getPromise: Promise<T> | null = null;

  let getSubscription: Subscription | null = null;
  let setSubscription: Subscription | null = null;

  let subscriptionCount = 0;

  const { logging } = options;

  const load = (force = false): Promise<T> => {
    if (!force && getPromise != null) {
      return getPromise;
    }

    getSubscription?.unsubscribe();

    try {
      const getValue = get();

      if (getValue instanceof Promise) {
        getPromise = getValue;

        getSubscription = from(getValue)
          .pipe(toResult())
          .subscribe((value) => {
            state$.next(value);
          });
      } else if (getValue instanceof Observable) {
        getPromise = new Promise((resolve, reject) => {
          getSubscription = getValue
            .pipe(
              tap({
                next: (value) => {
                  resolve(value);
                },
                error: (error) => {
                  reject(error);
                },
              }),
              toResult(),
            )
            .subscribe((value) => {
              state$.next(value);
            });
        });
      } else {
        getPromise = Promise.resolve(getValue);

        state$.next(ok(getValue));
      }

      return getPromise;
    } catch (value) {
      state$.next(error(value));

      return Promise.reject(value);
    }
  };

  return {
    next: (nextValue: T) => {
      const value = state$.getValue();

      if (value?.isOk() && nextValue === value.valueOf()) {
        return;
      }

      getSubscription?.unsubscribe();
      setSubscription?.unsubscribe();

      getSubscription = null;
      setSubscription = null;

      state$.next(ok(nextValue));

      if (set != null) {
        const setResult = set(nextValue);

        if (setResult instanceof Promise) {
          setSubscription = from(setResult)
            .pipe(filter(isDefined), toResult())
            .subscribe((value) => {
              state$.next(value);
            });
        } else if (setResult instanceof Observable) {
          setSubscription = setResult
            .pipe(filter(isDefined), toResult())
            .subscribe((value) => {
              state$.next(value);
            });
        } else if (setResult != null) {
          state$.next(ok(setResult));
        }
      }
    },
    subscribe: (observerOrNext: ObserverOrNext<Result<T>>) => {
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
          }),
        )
        .subscribe(observerOrNext);
    },
    getValue: () => {
      return state$.getValue();
    },
    load,
  };
}
