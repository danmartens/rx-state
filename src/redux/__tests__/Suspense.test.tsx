import { render, screen, waitFor } from '@testing-library/react';
import { createStore } from '../createStore';
import { useStoreState } from '../useStoreState';
import { Suspense } from 'react';

describe('suspense', () => {
  test('works with async stores', async () => {
    const promise = jest.fn().mockResolvedValue(42);

    const store = createStore(123, promise);

    const Value: React.FC = () => {
      const value = useStoreState(store);

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

    expect(screen.getByTestId('value').textContent).toBe('42');

    expect(promise).toHaveBeenCalledTimes(1);
  });

  test('works with async stores 2', async () => {
    const promise = jest.fn().mockResolvedValue(42);

    const store = createStore(123, promise);

    const ValueA: React.FC = () => {
      const value = useStoreState(store);

      return <div data-testid="value-a">{value}</div>;
    };

    const ValueB: React.FC = () => {
      const value = useStoreState(store);

      return <div data-testid="value-b">{value}</div>;
    };

    render(
      <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
        <ValueA />
        <ValueB />
      </Suspense>
    );

    expect(screen.getByTestId('suspense')).toBeVisible();

    await waitFor(() => {
      const valueA = screen.getByTestId('value-a');

      expect(valueA).toBeInTheDocument();
    });

    await waitFor(() => {
      const valueB = screen.getByTestId('value-b');

      expect(valueB).toBeInTheDocument();
    });

    expect(screen.getByTestId('value-a').textContent).toBe('42');
    expect(screen.getByTestId('value-b').textContent).toBe('42');

    expect(promise).toHaveBeenCalledTimes(1);
  });

  test('works with async stores 3', async () => {
    const promise = jest.fn().mockResolvedValue({ value: 42 });

    const store = createStore<{ value: number }>({ value: 123 }, promise);

    const Value: React.FC = () => {
      const { value } = useStoreState(store);

      return <div data-testid="value">{value}</div>;
    };

    const result = render(
      <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
        <Value />
      </Suspense>
    );

    expect(screen.getByTestId('suspense')).toBeVisible();

    await waitFor(() => {
      const value = screen.getByTestId('value');

      expect(value).toBeInTheDocument();
    });

    expect(screen.getByTestId('value').textContent).toBe('42');

    expect(promise).toHaveBeenCalledTimes(1);

    result.unmount();

    render(
      <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
        <Value />
      </Suspense>
    );

    await waitFor(() => {
      const value = screen.getByTestId('value');

      expect(value).toBeInTheDocument();
    });

    expect(screen.getByTestId('value').textContent).toBe('42');

    expect(promise).toHaveBeenCalledTimes(1);
  });
});
