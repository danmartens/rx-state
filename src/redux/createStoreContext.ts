import {
  ComponentType,
  ReactNode,
  createContext,
  createElement,
  useContext,
  useState,
} from 'react';
import {
  Action,
  Store,
  ReducerStore,
  StoreFactory,
  ReducerStoreFactory,
} from './types';
import { useStore } from './useStore';

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

    const [store] = useState(() => storeFactory(initialState));

    // @ts-expect-error
    return createElement(StoreContext.Provider, { value: store }, children);
  };

  return {
    Provider,
    useStore: () => {
      const store = useContext(StoreContext);

      if (store == null) {
        throw new Error('Store is not initialized');
      }

      return useStore(store);
    },
    useStoreContext: () => {
      const store = useContext(StoreContext);

      if (store == null) {
        throw new Error('Store is not initialized');
      }

      return store;
    },
  };
}
