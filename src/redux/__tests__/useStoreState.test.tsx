import { act, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';

import { createSelector } from '../createSelector';
import { createStore } from '../createStore';
import { useStoreState } from '../useStoreState';
import { StoreStatus } from '../types';

describe('useStoreState', () => {
  test('works with selectors', async () => {
    const n1 = createStore(0, () => Promise.resolve(1));
    const n2 = createStore(0, () => Promise.resolve(2));

    const sum = createSelector((get) => {
      return get(n1) + get(n2);
    });

    expect(sum.getStatus()).toBe(StoreStatus.Initial);

    const Value: React.FC = () => {
      const value = useStoreState(sum);

      return <div data-testid="value">{value}</div>;
    };

    render(
      <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
        <Value />
      </Suspense>
    );

    expect(screen.getByTestId('suspense')).toBeVisible();

    await waitFor(() => {
      const value = screen.getByTestId('value');

      expect(value).toBeInTheDocument();
    });

    expect(screen.getByTestId('value').textContent).toBe('3');

    act(() => {
      n1.next(3);
    });

    expect(screen.getByTestId('value').textContent).toBe('5');
  });
});
