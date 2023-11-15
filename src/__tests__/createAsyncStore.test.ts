import { createAsyncStore } from '../createAsyncStore';
import { Result, error, ok } from '../result';

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
    const values: Result<number>[] = [];

    const subscription = count.subscribe((value) => {
      values.push(value);
    });

    expect(values).toEqual([]);

    await nextTick();

    expect(values).toEqual([ok(42)]);

    subscription.unsubscribe();
  });

  test('calling next should update the state and cancel the getter', async () => {
    const count = createAsyncStore(() => Promise.resolve(42));
    const values: Result<number>[] = [];

    const subscription = count.subscribe((value) => {
      values.push(value);
    });

    count.next(43);

    expect(values).toEqual([ok(43)]);

    await nextTick();

    expect(values).toEqual([ok(43)]);

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

    const values: Result<number>[] = [];

    const subscription = count.subscribe((value) => {
      values.push(value);
    });

    count.next(43);

    expect(values).toEqual([ok(43)]);

    await nextTick();

    expect(values).toEqual([ok(43), ok(44)]);

    subscription.unsubscribe();
  });

  describe('error handling', () => {
    test('load should reject if the getter throws', async () => {
      const count = createAsyncStore(() => {
        throw new Error('Test error');
      });

      await expect(count.load()).rejects.toThrow('Test error');
    });

    test('load should reject if the getter returns a promise that rejects', async () => {
      const count = createAsyncStore(async () => {
        throw new Error('Test error');
      });

      await expect(count.load()).rejects.toThrow('Test error');
    });

    test('state can be updated after the getter rejects', async () => {
      const count = createAsyncStore<number>(async () => {
        throw new Error('Test error');
      });

      const values: Result<number>[] = [];

      const subscription = count.subscribe({
        next: (value) => {
          values.push(value);
        },
      });

      await nextTick();

      expect(values).toEqual([error(new Error('Test error'))]);

      count.next(43);

      expect(values).toEqual([error(new Error('Test error')), ok(43)]);

      subscription.unsubscribe();
    });
  });
});

const nextTick = () => Promise.resolve();
