import { Subject } from 'rxjs';

import { createAsyncStore } from '../createAsyncStore';
import { type Result, error, ok } from '../result';

describe('createAsyncStore', () => {
  test('load should return a stable promise', () => {
    const count = createAsyncStore(() => Promise.resolve(42));

    expect(count.load()).toBe(count.load());
  });

  test('getter should be called lazily', async () => {
    const getter = vi.fn(() => Promise.resolve(42));
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
    const setter = vi.fn((value) => Promise.resolve(value));
    const count = createAsyncStore(() => Promise.resolve(42), setter);

    count.next(43);

    expect(setter).toHaveBeenCalledTimes(1);

    count.next(43);

    expect(setter).toHaveBeenCalledTimes(1);
  });

  test('returning a value from the setter should update the state', async () => {
    const count = createAsyncStore(
      async () => 42,
      async (value) => value + 1,
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

  describe('resubscribing', () => {
    test('restarts a load that was canceled by the last unsubscribe', async () => {
      let resolve: ((value: number) => void) | undefined;

      const getter = vi.fn(
        () =>
          new Promise<number>((r) => {
            resolve = r;
          }),
      );

      const count = createAsyncStore(getter);

      count.subscribe(() => {}).unsubscribe();

      const values: Result<number>[] = [];

      const subscription = count.subscribe((value) => {
        values.push(value);
      });

      expect(getter).toHaveBeenCalledTimes(2);

      resolve?.(42);

      await nextTick();
      await nextTick();

      expect(values).toEqual([ok(42)]);
      expect(count.getValue()).toEqual(ok(42));

      subscription.unsubscribe();
    });

    test('resubscribes to a live Observable after the last unsubscribe', () => {
      const source = new Subject<number>();
      const getter = vi.fn(() => source.asObservable());
      const count = createAsyncStore(getter);

      const first = count.subscribe(() => {});

      source.next(1);
      first.unsubscribe();

      const values: Result<number>[] = [];

      const second = count.subscribe((value) => {
        values.push(value);
      });

      source.next(2);

      expect(getter).toHaveBeenCalledTimes(2);
      expect(values).toEqual([ok(1), ok(2)]);

      second.unsubscribe();
    });

    test('does not reload a getter that already completed', async () => {
      const getter = vi.fn(() => Promise.resolve(42));
      const count = createAsyncStore(getter);

      const first = count.subscribe(() => {});

      await nextTick();
      await nextTick();

      first.unsubscribe();
      count.subscribe(() => {}).unsubscribe();

      expect(getter).toHaveBeenCalledTimes(1);
    });
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
