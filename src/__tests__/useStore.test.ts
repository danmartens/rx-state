import { renderHook, act } from '@testing-library/react';

import { createStore } from '../createStore';
import { useStore } from '../useStore';

describe('useStore()', () => {
  test('initial state', () => {
    const store = createStore((state) => state, [])(42, {});

    const { result, unmount } = renderHook(() => useStore(store));
    const [state] = result.current;

    expect(state).toEqual(42);

    unmount();
  });

  test('dispatching actions', () => {
    const store = createStore(
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state,
      [],
    )(42, {});

    const { result, unmount } = renderHook(() => useStore(store));

    const [, dispatch] = result.current;

    act(() => {
      dispatch({ type: 'INCREMENT' });
      dispatch({ type: 'INCREMENT' });
    });

    const [state] = result.current;

    expect(state).toEqual(44);
    expect(store.getState()).toEqual(44);

    unmount();
  });
});
