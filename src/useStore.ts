import { Action, Store, ReducerStore } from './types';
import { useStoreState } from './useStoreState';

export function useStore<TState, TAction extends Action>(
  store: Store<TState>
): [TState, (state: TState) => void];

export function useStore<TState, TAction extends Action>(
  store: ReducerStore<TState, TAction>
): [TState, (action: TAction) => void];

export function useStore<TState, TAction extends Action>(
  store: Store<TState> | ReducerStore<TState, TAction>
) {
  const state = useStoreState(store);

  return [state, store.next] as const;
}
