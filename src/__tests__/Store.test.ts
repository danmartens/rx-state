import { createStore } from '../createStore';

describe('Store', () => {
  describe('load()', () => {
    test('returns a stable promise', () => {
      const store = createStore(0);

      expect(store.load()).toBe(store.load());
    });

    test('returns a stable promise with a get function', () => {
      const store = createStore(0, { get: () => Promise.resolve(42) });

      expect(store.load()).toBe(store.load());
    });
  });
});
