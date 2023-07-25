import { screen } from '@testing-library/dom';
import { render, act } from '@testing-library/react';
import React, { ReactNode } from 'react';

import { createStore } from '../createStore';
import { createStoreContext } from '../createStoreContext';

describe('createActionDispatchHook', () => {
  test('createActionDispatchHook()', () => {
    const storeFactory = createStore(
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state,
      []
    );

    const { Provider, useStore, createActionDispatchHook } =
      createStoreContext(storeFactory);

    const useDispatch = createActionDispatchHook({
      increment: () => ({ type: 'INCREMENT' }),
    });

    const ProviderComponent = (props: { children: ReactNode }) => {
      const { children } = props;

      return (
        <Provider initialState={42} dependencies={{}}>
          {children}
        </Provider>
      );
    };

    let dispatcher: ReturnType<typeof useDispatch>;

    const ConsumerComponent = () => {
      dispatcher = useDispatch();

      const [state] = useStore();

      return <h1>{state}</h1>;
    };

    render(
      <ProviderComponent>
        <ConsumerComponent />
      </ProviderComponent>
    );

    expect(screen.getByRole('heading')).toHaveTextContent('42');

    act(() => {
      dispatcher.increment();
    });

    expect(screen.getByRole('heading')).toHaveTextContent('43');

    act(() => {
      dispatcher.increment();
    });

    expect(screen.getByRole('heading')).toHaveTextContent('44');
  });
});
