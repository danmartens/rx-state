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

import type { AsyncStore, Getter, ObserverOrNext, Setter } from './types';

import { error, ok, toResult, type Result } from './result';
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

  // Settles the promise returned by `load()` for an Observable getter that
  // hasn't emitted yet.
  let pending: Pending<T> | null = null;

  // Updates the state and keeps the promise returned by `load()` in sync with
  // it, so `load()` never resolves with a value that has since been replaced.
  const setState = (result: Result<T>) => {
    state$.next(result);

    if (result.isOk()) {
      pending?.resolve(result.valueOf());
      getPromise = Promise.resolve(result.valueOf());
    } else {
      pending?.reject(result.valueOf());
      getPromise = Promise.reject(result.valueOf());
      // Only callers of `load()` should observe the rejection.
      getPromise.catch(() => {});
    }

    pending = null;
  };

  const load = (force = false): Promise<T> => {
    if (!force && getPromise != null) {
      return getPromise;
    }

    getSubscription?.unsubscribe();

    try {
      const getValue = get();

      if (getValue instanceof Promise) {
        getPromise = getValue;

        getSubscription = from(getValue).pipe(toResult()).subscribe(setState);
      } else if (getValue instanceof Observable) {
        // Callers may already hold the promise of an earlier load that hasn't
        // settled; keep it so they receive this load's value.
        pending ??= createPending<T>();
        getPromise = pending.promise;

        getSubscription = getValue.pipe(toResult()).subscribe(setState);
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

      setState(ok(nextValue));

      if (set != null) {
        const setResult = set(nextValue);

        if (setResult instanceof Promise) {
          setSubscription = from(setResult)
            .pipe(filter(isDefined), toResult())
            .subscribe(setState);
        } else if (setResult instanceof Observable) {
          setSubscription = setResult
            .pipe(filter(isDefined), toResult())
            .subscribe(setState);
        } else if (setResult != null) {
          setState(ok(setResult));
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
              // If the getter hasn't finished (an in-flight Promise or a live
              // Observable), drop the cached promise so the next subscriber
              // starts a new load instead of waiting on a canceled one.
              if (getSubscription != null && !getSubscription.closed) {
                getPromise = null;
              }

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

interface Pending<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

function createPending<T>(): Pending<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
