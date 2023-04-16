import { Observable, Observer, Subscription } from 'rxjs';

export interface Action<T = any> {
  type: T;
}

export type ActionOfType<T extends Action['type']> = Extract<
  Action,
  { type: T }
>;

export interface Store<TState, TAction extends Action> {
  next(action: TAction): void;
  subscribe(observer: Partial<Observer<TState>>): Subscription;
  getState(): TState;
}

export type Effect<
  TAction extends Action,
  TState,
  TDependencies extends Record<string, unknown> = {}
> = (
  action$: Observable<TAction>,
  state$: Observable<TState>,
  dependencies: TDependencies
) => Observable<TAction>;
