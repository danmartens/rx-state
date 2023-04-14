import {
  ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
} from 'react';

import { Action, Store } from './types';
import { useStoreState } from './useStoreState';
import { useStoreDispatch } from './useStoreDispatch';

export const createStoreContext = <
  TState,
  TAction extends Action,
  TDependencies extends Record<string, unknown> = {}
>(
  storeFactory: (
    dependencies: TDependencies
  ) => (initialState: TState) => Store<TState, TAction>
) => {
  const StoreContext = createContext<Store<TState, TAction> | null>(null);

  const Provider: React.FC<{
    initialState: TState;
    dependencies: TDependencies;
    children: ReactNode;
  }> = (props) => {
    const { initialState, dependencies, children } = props;

    const store = useRef(storeFactory(dependencies)(initialState)).current;

    return createElement(StoreContext.Provider, { value: store }, children);
  };

  const useSelector = <TSelected>(selector: (state: TState) => TSelected) => {
    const store = useContext(StoreContext);

    if (store == null) {
      throw new Error('Store is not initialized');
    }

    return useSyncExternalStore(
      (onChange) => {
        const subscription = store.subscribe({
          next: () => {
            onChange();
          },
        });

        return () => {
          subscription.unsubscribe();
        };
      },
      () => selector(store.getState())
    );
  };

  const useDispatch = () => {
    const store = useContext(StoreContext);

    if (store == null) {
      throw new Error('Store is not initialized');
    }

    return useCallback(
      (action: TAction) => {
        store.next(action);
      },
      [store]
    );
  };

  const useStore = () => {
    const store = useContext(StoreContext);

    if (store == null) {
      throw new Error('Store is not initialized');
    }

    const state = useStoreState(store);
    const dispatch = useStoreDispatch(store);

    return [state, dispatch] as const;
  };

  return {
    Provider,
    useSelector,
    useDispatch,
    useStore,
  };
};
