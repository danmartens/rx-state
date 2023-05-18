import {
  ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
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

    const subscribe = useCallback(
      (onChange: () => void) => {
        if (store == null) {
          throw new Error('Store is not initialized');
        }

        const subscription = store.subscribe({
          next: () => {
            onChange();
          },
        });

        return () => {
          subscription.unsubscribe();
        };
      },
      [store]
    );

    if (store == null) {
      throw new Error('Store is not initialized');
    }

    return useSyncExternalStore(subscribe, () => selector(store.getState()));
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

  const createActionDispatchHook = <
    TActionCreators extends Record<string, (...args: any[]) => TAction>
  >(
    actionCreators: TActionCreators
  ) => {
    return () => {
      const dispatch = useDispatch();

      return useMemo(() => {
        return Object.fromEntries(
          Object.entries(actionCreators).map(([key, actionCreator]) => {
            return [key, (...args) => dispatch(actionCreator(...args))];
          })
        ) as {
          [K in keyof TActionCreators]: (
            ...args: Parameters<TActionCreators[K]>
          ) => void;
        };
      }, [dispatch]);
    };
  };

  return {
    Provider,
    createActionDispatchHook,
    useSelector,
    useDispatch,
    useStore,
  };
};
