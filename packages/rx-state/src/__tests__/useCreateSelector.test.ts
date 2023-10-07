import { act, renderHook } from '@testing-library/react-hooks';
import { createStore } from '../createStore';
import { useCreateSelector } from '../useCreateSelector';
import { useCallback } from 'react';

describe('useCreateSelector', () => {
  test('works with sync stores', () => {
    const n1 = createStore(1);
    const n2 = createStore(2);

    const { result, unmount } = renderHook(() =>
      useCreateSelector(
        useCallback((get) => {
          return get(n1) + get(n2);
        }, [])
      )
    );

    expect(result.current).toEqual(3);

    act(() => {
      n1.next(4);
    });

    expect(result.current).toEqual(6);

    unmount();
  });
});
