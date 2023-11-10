import React, { Suspense, Component, type ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { useAsyncStore } from '../useAsyncStore';
import { createAsyncStore } from '../createAsyncStore';

describe('useAsyncStore', () => {
  describe('when the load promise resolves', () => {
    test('renders the suspense boundary', async () => {
      const count = createAsyncStore(async () => 42);

      const Counter: React.FC = () => {
        const [state] = useAsyncStore(count);

        return <div data-testid="state">{state}</div>;
      };

      render(
        <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
          <Counter />
        </Suspense>
      );

      expect(screen.getByTestId('suspense')).toBeVisible();

      await waitFor(() => {
        const state = screen.getByTestId('state');

        expect(state).toBeInTheDocument();
      });

      expect(screen.getByTestId('state').textContent).toBe('42');
    });
  });

  describe('when the load promise rejects', () => {
    const onError = (event: ErrorEvent) => {
      event.preventDefault();
    };

    beforeEach(() => {
      window.addEventListener('error', onError);
    });

    afterEach(() => {
      window.removeEventListener('error', onError);
    });

    test('renders the error boundary', async () => {
      const count = createAsyncStore(() =>
        Promise.reject(new Error('Test error'))
      );

      const Counter: React.FC = () => {
        const [state] = useAsyncStore(count);

        return <div data-testid="state">{state}</div>;
      };

      render(
        <ErrorBoundary>
          <Suspense fallback={<div data-testid="suspense">Loading...</div>}>
            <Counter />
          </Suspense>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('suspense')).toBeVisible();

      await waitFor(() => {
        const error = screen.getByTestId('error');

        expect(error).toBeInTheDocument();
      });

      expect(screen.getByTestId('error').textContent).toBe('Test error');
    });
  });
});

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