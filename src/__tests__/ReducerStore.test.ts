import { createReducerStore } from '../createReducerStore';

describe('ReducerStore', () => {
  describe('load()', () => {
    test('returns a stable promise', () => {
      const store = createReducerStore(0, {}, (state) => {
        return state;
      });

      expect(store.load()).toBe(store.load());
    });
  });
});
