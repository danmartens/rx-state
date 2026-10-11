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

  describe('load() after the state changes', () => {
    test('resolves with the value passed to next', async () => {
      const count = createAsyncStore(() => Promise.resolve(42));

      await count.load();

      count.next(43);

      await expect(count.load()).resolves.toBe(43);
    });

    test('resolves with the value returned by the setter', async () => {
      const count = createAsyncStore(
        () => Promise.resolve(42),
        async (value) => value * 2,
      );

      await count.load();

      count.next(5);

      await expect(count.load()).resolves.toBe(5);

      await nextTick();
      await nextTick();

      await expect(count.load()).resolves.toBe(10);
    });

    test('rejects when the setter rejects', async () => {
      const count = createAsyncStore(
        () => Promise.resolve(42),
        async () => {
          throw new Error('Test error');
        },
      );

      await count.load();

      count.next(5);

      await nextTick();
      await nextTick();

      await expect(count.load()).rejects.toThrow('Test error');
    });

    test('resolves when next cancels a pending Observable getter', async () => {
      const count = createAsyncStore(() => new Subject<number>());

      const pending = count.load();

      count.next(43);

      await expect(pending).resolves.toBe(43);
      await expect(count.load()).resolves.toBe(43);
    });

    test('resolves with the latest value of an Observable getter', async () => {
      const source = new Subject<number>();
      const count = createAsyncStore(() => source.asObservable());

      const subscription = count.subscribe(() => {});
      const pending = count.load();

      source.next(1);
      source.next(2);

      await expect(pending).resolves.toBe(1);
      await expect(count.load()).resolves.toBe(2);

      subscription.unsubscribe();
    });
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
