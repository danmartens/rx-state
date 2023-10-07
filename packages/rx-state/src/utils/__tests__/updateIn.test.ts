import { updateIn } from '../updateIn';

describe('updateIn', () => {
  describe('setting the same value', () => {
    test('1 key', () => {
      const stateA = { a: true };
      const stateB = updateIn(stateA, 'a', (value) => value);

      expect(stateB).toBe(stateA);
    });

    test('2 keys', () => {
      const stateA = { a: { b: true } };
      const stateB = updateIn(stateA, 'a', 'b', (value) => value);

      expect(stateB).toBe(stateA);
      expect(stateB.a).toBe(stateA.a);
    });

    test('3 keys', () => {
      const stateA = { a: { b: { c: true } } };
      const stateB = updateIn(stateA, 'a', 'b', 'c', (value) => value);

      expect(stateB).toBe(stateA);
      expect(stateB.a).toBe(stateA.a);
      expect(stateB.a.b).toBe(stateA.a.b);
    });

    test('4 keys', () => {
      const stateA = { a: { b: { c: { d: true } } } };
      const stateB = updateIn(stateA, 'a', 'b', 'c', 'd', (value) => value);

      expect(stateB).toBe(stateA);
      expect(stateB.a).toBe(stateA.a);
      expect(stateB.a.b).toBe(stateA.a.b);
      expect(stateB.a.b.c).toBe(stateA.a.b.c);
    });
  });

  describe('setting a different value', () => {
    test('1 key', () => {
      const stateA = { a: true };
      const stateB = updateIn(stateA, 'a', (value) => !value);

      expect(stateA).not.toBe(stateB);

      expect(stateB).toEqual({
        a: false,
      });
    });

    test('2 keys', () => {
      const stateA = { a: { b: true } };
      const stateB = updateIn(stateA, 'a', 'b', (value) => !value);

      expect(stateA).not.toBe(stateB);
      expect(stateA.a).not.toBe(stateB.a);

      expect(stateB).toEqual({
        a: {
          b: false,
        },
      });
    });

    test('3 keys', () => {
      const stateA = { a: { b: { c: true } } };
      const stateB = updateIn(stateA, 'a', 'b', 'c', (value) => !value);

      expect(stateA).not.toBe(stateB);
      expect(stateA.a).not.toBe(stateB.a);
      expect(stateA.a.b).not.toBe(stateB.a.b);

      expect(stateB).toEqual({
        a: {
          b: {
            c: false,
          },
        },
      });
    });

    test('4 keys', () => {
      const stateA = { a: { b: { c: { d: true } } } };
      const stateB = updateIn(stateA, 'a', 'b', 'c', 'd', (value) => !value);

      expect(stateA).not.toBe(stateB);
      expect(stateA.a).not.toBe(stateB.a);
      expect(stateA.a.b).not.toBe(stateB.a.b);
      expect(stateA.a.b.c).not.toBe(stateB.a.b.c);

      expect(stateB).toEqual({
        a: {
          b: {
            c: {
              d: false,
            },
          },
        },
      });
    });
  });
});
