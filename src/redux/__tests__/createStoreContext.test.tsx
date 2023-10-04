import { act, renderHook } from '@testing-library/react-hooks';
import { ReactNode, useCallback } from 'react';

import { createReducerStoreFactory } from '../createReducerStoreFactory';
import { createStore } from '../createStore';
import { createStoreContext } from '../createStoreContext';
import { createStoreFactory } from '../createStoreFactory';
import { useCreateSelector } from '../useCreateSelector';

describe('createStoreContext', () => {
  test('works with stores', () => {
    const factory = createStoreFactory<number>();
    const Context = createStoreContext(factory);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Context.Provider initialState={42}>{children}</Context.Provider>
    );

    const { result, unmount } = renderHook(() => Context.useStore(), {
      wrapper,
    });

    const [state] = result.current;

    expect(state).toEqual(42);

    unmount();
  });

  test('works with stores 2', () => {
    const factory = createStoreFactory<number>();
    const Context = createStoreContext(factory);

    const n1 = createStore(1);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Context.Provider initialState={42}>{children}</Context.Provider>
    );

    const { result, unmount } = renderHook(
      () => {
        const store = Context.useStoreContext();

        return useCreateSelector(
          useCallback((get) => get(store) + get(n1), [])
        );
      },
      {
        wrapper,
      }
    );

    expect(result.current).toEqual(43);

    unmount();
  });

  test('works with reducer stores', () => {
    const factory = createReducerStoreFactory(
      (state: number, action: { type: 'INCREMENT' }) => {
        if (action.type === 'INCREMENT') {
          return state + 1;
        }

        return state;
      }
    );

    const Context = createStoreContext(factory);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Context.Provider initialState={42}>{children}</Context.Provider>
    );

    const { result, unmount } = renderHook(() => Context.useStore(), {
      wrapper,
    });

    let [state, dispatch] = result.current;

    expect(state).toEqual(42);

    act(() => {
      dispatch({ type: 'INCREMENT' });
    });

    [state] = result.current;

    expect(state).toEqual(43);

    unmount();
  });
});
