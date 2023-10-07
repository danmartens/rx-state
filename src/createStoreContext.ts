import {
  ComponentType,
  ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Action,
  Store,
  ReducerStore,
  StoreFactory,
  ReducerStoreFactory,
} from './types';
import { useStore as useStoreInternal } from './useStore';

export function createStoreContext<TState, TAction extends Action>(
  storeFactory: StoreFactory<TState>
): {
  Provider: ComponentType<{
    initialState: TState;
    children: ReactNode;
  }>;
  useStore: () => [TState, (state: TState) => void];
  useStoreContext: () => Store<TState>;
};

export function createStoreContext<TState, TAction extends Action>(
  storeFactory: ReducerStoreFactory<TState, TAction>
): {
  Provider: ComponentType<{
    initialState: TState;
    children: ReactNode;
  }>;
  useSelector: <TSelected>(selector: (state: TState) => TSelected) => TSelected;
  useDispatch: () => (action: TAction) => void;
  useStore: () => [TState, (action: TAction) => void];
  useStoreContext: () => ReducerStore<TState, TAction>;
};

export function createStoreContext<TState, TAction extends Action>(
  storeFactory: StoreFactory<TState> | ReducerStoreFactory<TState, TAction>
) {
  const StoreContext = createContext<Store<TState> | null>(null);

  const Provider: React.FC<{
    initialState: TState;
    children: ReactNode;
  }> = (props) => {
    const { initialState, children } = props;

    const [store] = useState(() => storeFactory(initialState, {}));

    // @ts-expect-error
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

    return useSyncExternalStore(
      subscribe,
      () => selector(store.getValue()),
      () => selector(store.getValue())
    );
  };

  const useDispatch = () => {
    const store = useContext(StoreContext);

    if (store == null) {
      throw new Error('Store is not initialized');
    }

    return store.next;
  };

  const useStore = () => {
    const store = useContext(StoreContext);

    if (store == null) {
      throw new Error('Store is not initialized');
    }

    return useStoreInternal(store);
  };

  const useStoreContext = () => {
    const store = useContext(StoreContext);

    if (store == null) {
      throw new Error('Store is not initialized');
    }

    return store;
  };

  return {
    Provider,
    useSelector,
    useDispatch,
    useStore,
    useStoreContext,
  };
}
