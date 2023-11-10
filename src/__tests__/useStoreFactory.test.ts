import { renderHook } from '@testing-library/react-hooks';
import { createStore } from '../createStore';
import { useStoreFactory } from '../useStoreFactory';

describe('useStoreFactory()', () => {
  test('changing the initial state argument does not change the state', () => {
    const factory = createStore((state: { message: string }) => state, []);

    const initialState = { message: 'Hello' };
    const stateRef = { current: initialState };

    const { result, rerender } = renderHook(() =>
      useStoreFactory(factory, stateRef.current, {})
    );

    expect(result.current[0]).toBe(initialState);

    stateRef.current = { message: 'World' };

    rerender();

    expect(result.current[0]).toBe(initialState);
  });
});
