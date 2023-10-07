import { act, renderHook } from '@testing-library/react-hooks';
import { createStoreFactory } from '../createStoreFactory';
import { useStoreFactory } from '../useStoreFactory';
import { createReducerStoreFactory } from '../createReducerStoreFactory';
import { Action } from '../types';

describe('useStoreFactory', () => {
  describe('store', () => {
    test('initial state', () => {
      const factory = createStoreFactory<number>();

      const { result, unmount } = renderHook(() =>
        useStoreFactory(factory, 42)
      );

      const [state] = result.current;

      expect(state).toEqual(42);

      unmount();
    });

    test('updating', () => {
      const factory = createStoreFactory<number>();

      const { result, unmount } = renderHook(() =>
        useStoreFactory(factory, 42)
      );

      const [, setState] = result.current;

      act(() => {
        setState(84);
      });

      const [state] = result.current;

      expect(state).toEqual(84);

      unmount();
    });
  });

  describe('reducer store', () => {
    test('initial state', () => {
      const factory = createReducerStoreFactory(
        (state: number, _action: Action) => state
      );

      const { result, unmount } = renderHook(() =>
        useStoreFactory(factory, 42, {})
      );

      const [state] = result.current;

      expect(state).toEqual(42);

      unmount();
    });

    test('dispatching actions', () => {
      const factory = createReducerStoreFactory(
        (state: number, action: { type: 'INCREMENT' }) =>
          action.type === 'INCREMENT' ? state + 1 : state
      );

      const { result, unmount } = renderHook(() =>
        useStoreFactory(factory, 42, {})
      );

      const [, dispatch] = result.current;

      act(() => {
        dispatch({ type: 'INCREMENT' });
        dispatch({ type: 'INCREMENT' });
      });

      const [state] = result.current;

      expect(state).toEqual(44);

      unmount();
    });
  });
});
