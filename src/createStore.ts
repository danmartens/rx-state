import {
  BehaviorSubject,
  Observable,
  Observer,
  Subject,
  Subscription,
  finalize,
} from 'rxjs';

type Effect<Action, State> = (
  action$: Observable<Action>,
  state$: Observable<State>
) => Observable<Action>;

export interface Store<State, Action> {
  next(action: Action): void;
  subscribe(observer: Partial<Observer<State>>): Subscription;
  getState(): State;
}

export const createStore =
  <State, Action>(
    reducer: (state: State, action: Action) => State,
    effects: Effect<Action, State>[] = []
  ) =>
  (initialState: State): Store<State, Action> => {
    const state$ = new BehaviorSubject<State>(initialState);
    const action$ = new Subject<Action>();

    const dispatch = (action: Action) => {
      state$.next(reducer(state$.getValue(), action));
      action$.next(action);
    };

    let subscriptionCount = 0;
    const effectSubscriptions = new Set<Subscription>();

    return {
      next: (action: Action) => {
        dispatch(action);
      },
      subscribe: (observer: Observer<State>) => {
        if (effectSubscriptions.size === 0) {
          for (const effect of effects) {
            effectSubscriptions.add(
              effect(action$, state$).subscribe((action) => {
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
