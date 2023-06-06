import {
  BehaviorSubject,
  Observer,
  Subscription,
  distinctUntilChanged,
  finalize,
} from 'rxjs';

import { Action, Dispatcher, Effect, Store, StoreFactory } from './types';
import { createDispatcher } from './createDispatcher';

export const createStore =
  <
    TState,
    TAction extends Action,
    TDependencies extends Record<string, unknown> = {}
  >(
    reducer: (state: TState, action: TAction) => TState,
    effects: Effect<TAction, TState, TDependencies>[] = [],
    action$: Dispatcher<TAction> = createDispatcher()
  ): StoreFactory<TState, TAction, TDependencies> =>
  (
    initialState: TState,
    dependencies: TDependencies
  ): Store<TState, TAction> => {
    const state$ = new BehaviorSubject<TState>(initialState);

    const distinctState$ = state$.pipe(distinctUntilChanged());

    const dispatch = (action: TAction) => {
      state$.next(reducer(state$.getValue(), action));

      action$.next(action);
    };

    let subscriptionCount = 0;
    const effectSubscriptions = new Set<Subscription>();

    return {
      next: (action: TAction) => {
        dispatch(action);
      },
      subscribe: (observer: Observer<TState>) => {
        if (effectSubscriptions.size === 0) {
          for (const effect of effects) {
            effectSubscriptions.add(
              effect(action$, distinctState$, dependencies).subscribe(
                (action) => {
                  dispatch(action);
                }
              )
            );
          }
        }

        subscriptionCount++;

        return distinctState$
          .pipe(
            finalize(() => {
              subscriptionCount--;

              if (subscriptionCount === 0) {
                for (const subscription of effectSubscriptions) {
                  subscription.unsubscribe();
                }

                effectSubscriptions.clear();
              }
            })
          )
          .subscribe(observer);
      },
      getState: () => state$.getValue(),
    };
  };
