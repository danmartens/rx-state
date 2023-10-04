import { createStore } from '../createStore';
import { StoreStatus } from '../types';

describe('createStore', () => {
  test('getters work', () => {
    const enabled = createStore(true, () => false);

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
    const enabled = createStore(true, async () => true);

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
    const enabled = createStore(0, async () => 1);

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
    const getter = jest.fn().mockReturnValue(false);

    const enabled = createStore(true, getter);

    expect(getter).not.toHaveBeenCalled();

    const values: boolean[] = [];

    const subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([false]);

    subscription.unsubscribe();

    expect(getter).toHaveBeenCalledTimes(1);
  });

  test('setters work', () => {
    const setter = jest.fn();

    const enabled = createStore(true, () => false, setter);

    const values: boolean[] = [];

    const subscription = enabled.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([false]);

    enabled.next(true);

    expect(values).toEqual([false, true]);

    subscription.unsubscribe();

    expect(setter).toHaveBeenCalledWith(true);
  });

  test('sync stores start with status "HasValue"', () => {
    const store = createStore(123);

    expect(store.getStatus()).toBe(StoreStatus.HasValue);
  });

  test('async stores start with status "Loading"', async () => {
    const store = createStore(123, () => Promise.resolve(42));

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
    const store = createStore(123, () => Promise.reject(42));

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
