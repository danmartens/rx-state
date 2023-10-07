import {
  BehaviorSubject,
  Subscription,
  distinctUntilChanged,
  finalize,
} from 'rxjs';

import {
  Action,
  StoreStatus,
  ReducerStore,
  Effect,
  ReducerStoreOptions,
} from './types';
import { createDispatcher } from './createDispatcher';
import { isRecord } from './utils/isRecord';
import { formatChangeset } from './utils/formatChangeset';
import { diffObjects } from './utils/diffObjects';

export function createReducerStore<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
>(
  initialState: TState,
  dependencies: TDependencies,
  reducer: (state: TState, action: TAction) => TState,
  effects: Effect<TState, TAction, TDependencies>[] = [],
  options: ReducerStoreOptions<TState, TAction> = {}
): ReducerStore<TState, TAction> {
  const state$ = new BehaviorSubject(initialState);
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

  const initialStatePromise = Promise.resolve(initialState);

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
          effect(action$, distinctState$, dependencies).subscribe((action) => {
            dispatch(action);
          })
        );
      }
    }
  };

  if (hot) {
    createActionsSubscription();
    createEffectsSubscription();
  }

  return {
    next: (action) => {
      dispatch(action);
    },
    subscribe: (observerOrNext) => {
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
        .subscribe(observerOrNext);
    },
    getStatus: () => StoreStatus.HasValue,
    getError: () => null,
    getValue: () => state$.getValue(),
    load: () => initialStatePromise,
  };
}
