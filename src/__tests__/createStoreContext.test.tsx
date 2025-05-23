import type { ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';

import { createStore } from '../createStore';
import { createStoreContext } from '../createStoreContext';

describe('createStoreContext', () => {
  test('useSelector()', () => {
    const storeFactory = createStore((state: number) => state, []);

    const Context = createStoreContext(storeFactory);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Context.Provider initialState={42} dependencies={{}}>
        {children}
      </Context.Provider>
    );

    const { result, unmount } = renderHook(
      () => Context.useSelector((state) => state),
      { wrapper },
    );

    const state = result.current;

    expect(state).toEqual(42);

    unmount();
  });

  test('useStore()', () => {
    const storeFactory = createStore(
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state,
      [],
    );

    const { Provider, useStore } = createStoreContext(storeFactory);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider initialState={42} dependencies={{}}>
        {children}
      </Provider>
    );

    const { result } = renderHook(() => useStore(), { wrapper });

    // eslint-disable-next-line prefer-const
    let [state, dispatch] = result.current;

    expect(state).toEqual(42);

    act(() => {
      dispatch({ type: 'INCREMENT' });
    });

    [state] = result.current;

    expect(state).toEqual(43);
  });
});
