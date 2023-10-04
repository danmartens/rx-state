import { BehaviorSubject, Subscription, finalize } from 'rxjs';
import { Action, StoreStatus, ReducerStore } from './types';
import { createDispatcher } from './createDispatcher';

export function createReducerStore<TState, TAction extends Action>(
  initialState: TState,
  reducer: (state: TState, action: TAction) => TState
): ReducerStore<TState, TAction> {
  const state$ = new BehaviorSubject(initialState);
  const action$ = createDispatcher<TAction>();

  const dispatch = (action: TAction) => {
    action$.next(action);
  };

  let subscriptionCount = 0;
  let actionsSubscription: Subscription | null = null;

  const initialStatePromise = Promise.resolve(initialState);

  const createActionsSubscription = () => {
    if (actionsSubscription == null) {
      actionsSubscription = action$.subscribe((action) => {
        const state = state$.getValue();
        const nextState = reducer(state, action);

        if (state !== nextState) {
          state$.next(nextState);
        }
      });
    }
  };

  return {
    next: (action) => {
      dispatch(action);
    },
    subscribe: (observerOrNext) => {
      createActionsSubscription();

      subscriptionCount++;

      return state$
        .pipe(
          finalize(() => {
            subscriptionCount--;

            if (subscriptionCount === 0) {
              actionsSubscription?.unsubscribe();
              actionsSubscription = null;
            }
          })
        )
        .subscribe(observerOrNext);
    },
    getStatus() {
      return StoreStatus.HasValue;
    },
    getError() {
      return null;
    },
    getValue() {
      return state$.getValue();
    },
    load() {
      return initialStatePromise;
    },
  };
}
