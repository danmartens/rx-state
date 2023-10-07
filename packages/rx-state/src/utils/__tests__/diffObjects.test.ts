import { diffObjects } from '../diffObjects';

describe('diffObjects', () => {
  test('returns an empty object when the objects are the same', () => {
    const objectA = { a: 1, b: 2 };
    const objectB = { a: 1, b: 2 };

    expect(diffObjects(objectA, objectB)).toEqual({});
  });

  test('returns an empty object when the objects are the same (nested)', () => {
    const a = { b: 1 };
    const objectA = { a };
    const objectB = { a };

    expect(diffObjects(objectA, objectB)).toEqual({});
  });

  test('returns an empty object when the objects are the same (deeply nested)', () => {
    const a = { b: { c: 1 } };
    const objectA = { a };
    const objectB = { a };

    expect(diffObjects(objectA, objectB)).toEqual({});
  });

  test('returns an empty object when the objects are the same (deeply nested, multiple keys)', () => {
    const a = { b: { c: 1 } };
    const d = { e: { f: 2 } };

    const objectA = { a, d };
    const objectB = { a, d };

    expect(diffObjects(objectA, objectB)).toEqual({});
  });

  test('returns the correct changeset when the objects are different', () => {
    const objectA = { a: 1, b: 2 };
    const objectB = { a: 1, b: 3 };

    expect(diffObjects(objectA, objectB)).toEqual({ b: [2, 3] });
  });

  test('returns the correct changeset when the objects are different (nested)', () => {
    const a = { b: 1 };
    const objectA = { a };
    const objectB = { a: { b: 2 } };

    expect(diffObjects(objectA, objectB)).toEqual({ a: { b: [1, 2] } });
  });

  test('returns the correct changeset when the objects are different (deeply nested)', () => {
    const a = { b: { c: 1 } };
    const objectA = { a };
    const objectB = { a: { b: { c: 2 } } };

    expect(diffObjects(objectA, objectB)).toEqual({ a: { b: { c: [1, 2] } } });
  });

  test('returns the correct changeset when the objects are different (deeply nested, multiple keys)', () => {
    const a = { b: { c: 1 } };
    const d = { e: { f: 2 } };

    const objectA = { a, d };
    const objectB = { a: { b: { c: 2 } }, d: { e: { f: 3 } } };

    expect(diffObjects(objectA, objectB)).toEqual({
      a: { b: { c: [1, 2] } },
      d: { e: { f: [2, 3] } },
    });
  });

  test('returns the correct changeset when a key is added', () => {
    const objectA = { a: 1 };
    const objectB = { a: 1, b: 2 };

    expect(diffObjects(objectA, objectB)).toEqual({ b: [undefined, 2] });
  });

  test('returns the correct changeset when a key is removed', () => {
    const objectA = { a: 1, b: 2 };
    const objectB = { a: 1 };

    expect(diffObjects(objectA, objectB)).toEqual({ b: [2, undefined] });
  });
});
