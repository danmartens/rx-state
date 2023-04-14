import {
  BehaviorSubject,
  Observable,
  Observer,
  Subject,
  Subscription,
  finalize,
} from 'rxjs';
import { Effect, Store } from './types';

export const createStore =
  <TState, TAction, TDependencies extends Record<string, unknown> = {}>(
    reducer: (state: TState, action: TAction) => TState,
    effects: Effect<TAction, TState, TDependencies>[] = []
  ) =>
  (dependencies: TDependencies) =>
  (initialState: TState): Store<TState, TAction> => {
    const state$ = new BehaviorSubject<TState>(initialState);
    const action$ = new Subject<TAction>();

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
              effect(action$, state$, dependencies).subscribe((action) => {
                dispatch(action);
              })
            );
          }
        }

        subscriptionCount++;

        return state$
          .pipe(
            finalize(() => {
              subscriptionCount--;

              if (subscriptionCount === 0) {
                for (const subscription of effectSubscriptions) {
                  subscription.unsubscribe();
                }
              }
            })
          )
          .subscribe(observer);
      },
      getState: () => state$.getValue(),
    };
  };
