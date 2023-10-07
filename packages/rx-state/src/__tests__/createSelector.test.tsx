import { createReducerStore } from '../createReducerStore';
import { createSelector } from '../createSelector';
import { createStore } from '../createStore';

describe('createSelector', () => {
  test('works with sync stores', () => {
    const n1 = createStore(1);
    const n2 = createStore(2);

    const sum = createSelector((get) => {
      return get(n1) + get(n2);
    });

    let value: number | undefined;

    const subscription = sum.subscribe((nextValue) => {
      value = nextValue;
    });

    expect(value).toBe(3);

    n1.next(4);

    expect(value).toBe(6);

    n2.next(5);

    expect(value).toBe(9);

    subscription.unsubscribe();
  });

  test('works with async stores', async () => {
    const n1 = createStore(0, { get: () => Promise.resolve(1) });
    const n2 = createStore(0, { get: () => Promise.resolve(2) });

    const sum = createSelector((get) => {
      return get(n1) + get(n2);
    });

    const values: number[] = [];

    const subscription = sum.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([0]);

    await nextTick();

    expect(values).toEqual([0, 1, 3]);

    n1.next(4);

    await nextTick();

    expect(values).toEqual([0, 1, 3, 6]);

    subscription.unsubscribe();
  });

  test('works with async stores 2', async () => {
    const n1 = createStore(0, { get: () => Promise.resolve(1) });
    const n2 = createStore(0, { get: () => Promise.resolve(2) });

    const sum = createSelector((get) => {
      return get(n1) + get(n2);
    });

    const value = await sum.load();

    expect(value).toBe(3);
  });

  test('load returns a stable promise', () => {
    const n1 = createStore(0, { get: () => Promise.resolve(1) });
    const n2 = createStore(0, { get: () => Promise.resolve(2) });

    const sum = createSelector((get) => {
      return get(n1) + get(n2);
    });

    expect(sum.load()).toBe(sum.load());
  });

  test('works with reducer stores', async () => {
    const n1 = createReducerStore(
      0,
      {},
      (state: number, action: { type: 'INCREMENT' | 'DECREMENT' }) => {
        switch (action.type) {
          case 'INCREMENT':
            return state + 1;

          case 'DECREMENT':
            return state - 1;
        }
      }
    );

    const n2 = createStore(2);

    const sum = createSelector((get) => {
      return get(n1) + get(n2);
    });

    const values: number[] = [];

    const subscription = sum.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([2]);

    n1.next({
      type: 'INCREMENT',
    });

    expect(values).toEqual([2, 3]);

    n2.next(3);

    expect(values).toEqual([2, 3, 4]);

    n1.next({
      type: 'DECREMENT',
    });

    expect(values).toEqual([2, 3, 4, 3]);

    subscription.unsubscribe();
  });

  test('works with selectors', () => {
    const n1 = createStore(1);
    const n2 = createStore(2);

    const sum = createSelector((get) => {
      return get(n1) + get(n2);
    });

    const twiceSum = createSelector((get) => {
      return get(sum) * 2;
    });

    const values: number[] = [];

    const subscription = twiceSum.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([6]);

    n1.next(2);

    expect(values).toEqual([6, 8]);

    subscription.unsubscribe();
  });
});

const nextTick = async () => {};
