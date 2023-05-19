import { renderHook } from '@testing-library/react-hooks';

import { createStore } from '../createStore';
import { useStoreSelector } from '../useStoreSelector';

describe('useStoreSelector()', () => {
  test('initial state', () => {
    const store = createStore((state: number, _action) => state, [])(42);

    const { result, unmount } = renderHook(() =>
      useStoreSelector(store, (state) => state * 2)
    );

    expect(result.current).toEqual(42 * 2);

    unmount();
  });
});
