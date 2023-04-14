import { Action, Store } from './types';
import { useStoreDispatch } from './useStoreDispatch';
import { useStoreState } from './useStoreState';

export const useStore = <TState, TAction extends Action>(
  store: Store<TState, TAction>
) => {
  const state = useStoreState(store);
  const dispatch = useStoreDispatch(store);

  return [state, dispatch] as const;
};
