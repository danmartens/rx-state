import { createReducer } from '../createReducer';
import { createReducerStore } from '../createReducerStore';

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

describe('createReducer', () => {
  test('should return a reducer function', () => {
    const reducer = createReducer<number, Action>({
      DECREMENT: (state) => state - 1,
      INCREMENT: (state) => state + 1,
    });

    const store = createReducerStore(0, {}, reducer);

    expect(store.getValue()).toBe(0);

    const subscription = store.subscribe(() => {});

    store.next({ type: 'INCREMENT' });

    expect(store.getValue()).toBe(1);

    subscription.unsubscribe();
  });
});
