import { Observable, Observer, Subject, Subscription } from 'rxjs';

export interface Action<T = any> {
  type: T;
}

export type ActionOfType<
  TAction extends Action,
  TType extends TAction['type']
> = Extract<Action, { type: TType }>;

export interface Dispatcher<TAction extends Action> extends Subject<TAction> {}

export interface Store<TState, TAction extends Action> {
  next(action: TAction): void;
  subscribe(observer: Partial<Observer<TState>>): Subscription;
  getState(): TState;
}

export type StoreFactory<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
> = (
  initialState: TState,
  dependencies: TDependencies
) => Store<TState, TAction>;

export type Effect<
  TAction extends Action,
  TState,
  TDependencies extends Record<string, unknown> = {}
> = (
  action$: Dispatcher<TAction>,
  state$: Observable<TState>,
  dependencies: TDependencies
) => Observable<TAction>;
