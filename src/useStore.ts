import { Store } from './createStore';
import { useStoreDispatch } from './useStoreDispatch';
import { useStoreState } from './useStoreState';

export const useStore = <State, Action>(store: Store<State, Action>) => {
  const state = useStoreState(store);
  const dispatch = useStoreDispatch(store);

  return [state, dispatch] as const;
};
