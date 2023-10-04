import { act, renderHook } from '@testing-library/react-hooks';

import { createReducerStore } from '../createReducerStore';
import { Action } from '../types';
import { useStore } from '../useStore';

describe('useStore', () => {
  describe('reducer store', () => {
    test('initial state', () => {
      const store = createReducerStore(
        42,
        (state: number, _action: Action) => state
      );

      const { result, unmount } = renderHook(() => useStore(store));
      const [state] = result.current;

      expect(state).toEqual(42);

      unmount();
    });

    test('dispatching actions', () => {
      const store = createReducerStore(
        42,
        (state: number, action: { type: 'INCREMENT' }) =>
          action.type === 'INCREMENT' ? state + 1 : state
      );

      const { result, unmount } = renderHook(() => useStore(store));

      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: 'INCREMENT' });
        dispatch({ type: 'INCREMENT' });
      });

      const [state] = result.current;

      expect(state).toEqual(44);
      expect(store.getValue()).toEqual(44);

      unmount();
    });
  });
});
