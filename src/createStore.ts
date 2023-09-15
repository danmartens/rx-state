import {
  BehaviorSubject,
  Observer,
  Subscription,
  distinctUntilChanged,
  finalize,
} from 'rxjs';

import { Action, Dispatcher, Effect, Store, StoreFactory } from './types';
import { createDispatcher } from './createDispatcher';
import { formatChangeset } from './utils/formatChangeset';
import { diffObjects } from './utils/diffObjects';
import { isRecord } from './utils/isRecord';

interface Options<TState, TAction extends Action> {
  /**
   * If true, the store will update its state and run effects even if there are
   * no subscribers. By default, stores are lazy (cold observables) and will
   * only update their state and run effects when there are subscribers.
   */
  hot?: boolean;
  action$?: Dispatcher<TAction>;
  logging?: {
    name: string;
    actions?: boolean | ((action: TAction) => boolean);
    state?: boolean | ((state: TState) => boolean);
  };
}

export const createStore =
  <
    TState,
    TAction extends Action,
    TDependencies extends Record<string, unknown> = {}
  >(
    reducer: (state: TState, action: TAction) => TState,
    effects: Effect<TAction, TState, TDependencies>[] = [],
    options: Options<TState, TAction> = {}
  ): StoreFactory<TState, TAction, TDependencies> =>
  (
    initialState: TState,
    dependencies: TDependencies
  ): Store<TState, TAction> => {
    const state$ = new BehaviorSubject<TState>(initialState);
    const distinctState$ = state$.pipe(distinctUntilChanged());

    const action$ = options.action$ ?? createDispatcher<TAction>();

    const { hot = false, logging } = options;

    const logAction = (action: TAction, callbackFn: () => void) => {
      if (process.env.NODE_ENV === 'production') {
        callbackFn();
      } else if (logging?.actions != null) {
        if (
          (typeof logging.actions === 'function' && logging.actions(action)) ||
          logging.actions === true
        ) {
          console.group(`Action (${logging.name}): ${action.type}`);
          console.log(action);

          callbackFn();

          console.groupEnd();
        } else {
          callbackFn();
        }
      } else {
        callbackFn();
      }
    };

    const logState = (state: TState, nextState: TState) => {
      if (process.env.NODE_ENV !== 'production' && logging?.state != null) {
        if (
          state !== nextState &&
          ((typeof logging.state === 'function' && logging.state(nextState)) ||
            logging.state === true)
        ) {
          if (isRecord(state) && isRecord(nextState)) {
            console.log(formatChangeset(diffObjects(state, nextState)));
          }
        }
      }
    };

    const dispatch = (action: TAction) => {
      action$.next(action);
    };

    let subscriptionCount = 0;
    let actionsSubscription: Subscription | null = null;
    const effectSubscriptions = new Set<Subscription>();

    const createActionsSubscription = () => {
      if (actionsSubscription == null) {
        actionsSubscription = action$.subscribe((action) => {
          logAction(action, () => {
            const state = state$.getValue();
            const nextState = reducer(state, action);

            state$.next(nextState);

            logState(state, nextState);
          });
        });
      }
    };

    const createEffectsSubscription = () => {
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
    };

    if (hot) {
      createActionsSubscription();
      createEffectsSubscription();
    }

    return {
      next: (action: TAction) => {
        dispatch(action);
      },
      subscribe: (observer: Observer<TState>) => {
        createActionsSubscription();
        createEffectsSubscription();

        subscriptionCount++;

        return distinctState$
          .pipe(
            finalize(() => {
              subscriptionCount--;

              if (!hot && subscriptionCount === 0) {
                actionsSubscription?.unsubscribe();
                actionsSubscription = null;

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
