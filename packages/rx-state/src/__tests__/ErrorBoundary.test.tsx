import { Component, ReactNode, Suspense } from 'react';
import { createStore } from '../createStore';
import { useStoreState } from '../useStoreState';
import { render, screen, waitFor } from '@testing-library/react';

describe('error handling', () => {
  const onError = (event: ErrorEvent) => {
    event.preventDefault();
  };

  beforeEach(() => {
    window.addEventListener('error', onError);
  });

  afterEach(() => {
    window.removeEventListener('error', onError);
  });

  test('get() throws an error if the promise rejects', async () => {
    class ErrorBoundary extends Component<
      {
        children: ReactNode;
      },
      { error: Error | null }
    > {
      constructor(props: { children: ReactNode }) {
        super(props);

        this.state = {
          error: null,
        };
      }

      static getDerivedStateFromError(error: Error) {
        return { error };
      }

      componentDidCatch() {}

      render() {
        if (this.state.error != null) {
          return <div data-testid="error">{this.state.error.message}</div>;
        }

        return this.props.children;
      }
    }

    const get = jest.fn().mockRejectedValue(new Error('Promise rejected'));

    const store = createStore(123, { get });

    const Value: React.FC = () => {
      const value = useStoreState(store);

      return <div data-testid="value">{value}</div>;
    };

    render(
      <ErrorBoundary>
        <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
          <Value />
        </Suspense>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('suspense')).toBeVisible();

    await waitFor(() => {
      const error = screen.getByTestId('error');

      expect(error).toBeInTheDocument();
    });

    expect(screen.getByTestId('error').textContent).toBe('Promise rejected');

    expect(get).toHaveBeenCalledTimes(1);
  });
});
