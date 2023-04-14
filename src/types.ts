import { Observable, Observer, Subscription } from 'rxjs';

export interface Store<TState, TAction> {
  next(action: TAction): void;
  subscribe(observer: Partial<Observer<TState>>): Subscription;
  getState(): TState;
}

export type Effect<
  TAction,
  TState,
  TDependencies extends Record<string, unknown> = {}
> = (
  action$: Observable<TAction>,
  state$: Observable<TState>,
  dependencies: TDependencies
) => Observable<TAction>;
