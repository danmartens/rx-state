import { createAsyncStore } from '../createAsyncStore';

describe('createAsyncStore', () => {
  test('load should return a stable promise', () => {
    const count = createAsyncStore(() => Promise.resolve(42));

    expect(count.load()).toBe(count.load());
  });

  test('getter should be called lazily', async () => {
    const getter = jest.fn(() => Promise.resolve(42));
    const count = createAsyncStore(getter);

    expect(getter).not.toHaveBeenCalled();

    await count.load();

    expect(getter).toHaveBeenCalled();
  });

  test('state is initialized asynchronously', async () => {
    const count = createAsyncStore(() => Promise.resolve(42));
    const values: number[] = [];

    const subscription = count.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([]);

    await nextTick();

    expect(values).toEqual([42]);

    subscription.unsubscribe();
  });

  test('calling next should update the state and cancel the getter', async () => {
    const count = createAsyncStore(() => Promise.resolve(42));
    const values: number[] = [];

    const subscription = count.subscribe((value) => {
      values.push(value);
    });

    count.next(43);

    expect(values).toEqual([43]);

    await nextTick();

    expect(values).toEqual([43]);

    subscription.unsubscribe();
  });

  test('calling next with the current state should not call the setter', async () => {
    const setter = jest.fn((value) => Promise.resolve(value));
    const count = createAsyncStore(() => Promise.resolve(42), setter);

    count.next(43);

    expect(setter).toHaveBeenCalledTimes(1);

    count.next(43);

    expect(setter).toHaveBeenCalledTimes(1);
  });

  test('returning a value from the setter should update the state', async () => {
    const count = createAsyncStore(
      async () => 42,
      async (value) => value + 1
    );

    const values: number[] = [];

    const subscription = count.subscribe((value) => {
      values.push(value);
    });

    count.next(43);

    expect(values).toEqual([43]);

    await nextTick();

    expect(values).toEqual([43, 44]);

    subscription.unsubscribe();
  });
});

const nextTick = () => Promise.resolve();
