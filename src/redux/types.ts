import { Observable, Observer, Subject, Subscription } from 'rxjs';

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

export type ReducerStoreFactory<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
> = (
  initialState: TState,
  dependencies: TDependencies
) => ReducerStore<TState, TAction>;

export type Getter = <TState>(
  store: Store<TState> | ReducerStore<TState, any> | ReadonlyStore<TState>
) => TState;

export interface Dispatcher<TAction extends Action> extends Subject<TAction> {}

export type Effect<
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
> = (
  action$: Dispatcher<TAction>,
  state$: Observable<TState>,
  dependencies: TDependencies
) => Observable<TAction>;

export interface StoreOptions<TState> {
  logging?: {
    name: string;
    state?: boolean | ((state: TState) => boolean);
    status?: boolean;
  };
}

export interface ReducerStoreOptions<TState, TAction extends Action> {
  /**
   * If true, the store will update its state and run effects even if there are
   * no subscribers. By default, stores are lazy (cold observables) and will
   * only update their state and run effects when there are subscribers.
   *
   * See: https://benlesh.medium.com/hot-vs-cold-observables-f8094ed53339
   */
  hot?: boolean;
  action$?: Dispatcher<TAction>;
  logging?: {
    name: string;
    state?: boolean | ((state: TState) => boolean);
    actions?: boolean | ((action: TAction) => boolean);
  };
}
