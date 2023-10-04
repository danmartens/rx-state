import { Observer, Subject, Subscription } from 'rxjs';

export interface Action<T = any> {
  type: T;
}

export enum StoreStatus {
  Initial,
  Loading,
  HasValue,
  HasError,
}

export interface ReadonlyStore<TState> {
  subscribe(
    observerOrNext: Partial<Observer<TState>> | ((value: TState) => void)
  ): Subscription;
  getStatus(): StoreStatus;
  getError(): Error | null;
  getValue(): TState;
  load(): Promise<TState>;
}

export interface Store<TState> extends ReadonlyStore<TState> {
  next(state: TState): void;
}

export interface ReducerStore<TState, TAction> extends ReadonlyStore<TState> {
  next(action: TAction): void;
}

export type StoreFactory<TState> = (initialState: TState) => Store<TState>;

export type ReducerStoreFactory<TState, TAction extends Action> = (
  initialState: TState
) => ReducerStore<TState, TAction>;

export type Getter = <TState>(
  store: Store<TState> | ReducerStore<TState, any> | ReadonlyStore<TState>
) => TState;

export interface Dispatcher<TAction extends Action> extends Subject<TAction> {}
