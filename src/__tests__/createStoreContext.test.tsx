import { act, renderHook } from '@testing-library/react-hooks';
import { ReactNode } from 'react';

import { createStore } from '../createStore';
import { createStoreContext } from '../createStoreContext';

describe('createStoreContext', () => {
  test('useSelector()', () => {
    const storeFactory = createStore((state: number, _action) => state, []);

    const Context = createStoreContext(storeFactory);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Context.Provider initialState={42} dependencies={{}}>
        {children}
      </Context.Provider>
    );

    const { result, unmount } = renderHook(
      () => Context.useSelector((state) => state),
      { wrapper }
    );

    const state = result.current;

    expect(state).toEqual(42);

    unmount();
  });

  test('useStore()', () => {
    const storeFactory = createStore(
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state,
      []
    );

    const Context = createStoreContext(storeFactory);

    const wrapper = ({ children }: { children: ReactNode }) => (
      <Context.Provider initialState={42} dependencies={{}}>
        {children}
      </Context.Provider>
    );

    const { result } = renderHook(() => Context.useStore(), { wrapper });

    let [state, dispatch] = result.current;

    expect(state).toEqual(42);

    act(() => {
      dispatch({ type: 'INCREMENT' });
    });

    [state] = result.current;

    expect(state).toEqual(43);
  });
});
