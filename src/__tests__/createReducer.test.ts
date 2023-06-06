import { createReducer } from '../createReducer';
import { createStore } from '../createStore';

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

describe('createReducer', () => {
  test('should return a reducer function', () => {
    const reducer = createReducer<number, Action>({
      DECREMENT: (state) => state - 1,
      INCREMENT: (state) => state + 1,
    });

    const store = createStore(reducer)(0, {});

    expect(store.getState()).toBe(0);

    store.next({ type: 'INCREMENT' });

    expect(store.getState()).toBe(1);
  });
});
