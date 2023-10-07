import { createStore } from '../createStore';
import { StoreStatus } from '../types';

describe('createStore', () => {
  test('getters work', () => {
    const enabled = createStore(true, { get: () => false });

    const values: boolean[] = [];

    const subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([false]);

    enabled.next(true);

    expect(values).toEqual([false, true]);

    subscription.unsubscribe();
  });

  test('getters work 2', async () => {
    const enabled = createStore(true, { get: async () => true });

    const values: boolean[] = [];

    const subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([true]);

    await nextTick();

    expect(values).toEqual([true]);

    expect(enabled.getStatus()).toBe(StoreStatus.HasValue);

    subscription.unsubscribe();
  });

  test('getters work 3', async () => {
    const enabled = createStore(0, { get: async () => 1 });

    const values: number[] = [];

    let subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([0]);

    subscription.unsubscribe();

    await nextTick();

    subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([0, 0]);

    await nextTick();

    expect(values).toEqual([0, 0, 1]);

    expect(enabled.getStatus()).toBe(StoreStatus.HasValue);

    subscription.unsubscribe();
  });

  test('getters are lazy', () => {
    const get = jest.fn().mockReturnValue(false);

    const enabled = createStore(true, { get });

    expect(get).not.toHaveBeenCalled();

    const values: boolean[] = [];

    const subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([false]);

    subscription.unsubscribe();

    expect(get).toHaveBeenCalledTimes(1);
  });

  test('setters work', () => {
    const set = jest.fn();

    const enabled = createStore(true, { get: () => false, set });

    const values: boolean[] = [];

    const subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([false]);

    enabled.next(true);

    expect(values).toEqual([false, true]);

    subscription.unsubscribe();

    expect(set).toHaveBeenCalledWith(true);
  });

  test('sync stores start with status "HasValue"', () => {
    const store = createStore(123);

    expect(store.getStatus()).toBe(StoreStatus.HasValue);
  });

  test('async stores start with status "Loading"', async () => {
    const store = createStore(123, { get: () => Promise.resolve(42) });

    expect(store.getStatus()).toBe(StoreStatus.Initial);

    const values: number[] = [];

    const subscription = store.subscribe((value) => {
      values.push(value);
    });

    await nextTick();

    expect(values).toEqual([123, 42]);
    expect(store.getStatus()).toBe(StoreStatus.HasValue);

    subscription.unsubscribe();
  });

  test('async stores error', async () => {
    const store = createStore(123, { get: () => Promise.reject(42) });

    const values: number[] = [];

    const subscription = store.subscribe((value) => {
      values.push(value);
    });

    await nextTick();

    expect(values).toEqual([123]);
    expect(store.getStatus()).toBe(StoreStatus.HasError);

    subscription.unsubscribe();
  });
});

const nextTick = async () => {};
