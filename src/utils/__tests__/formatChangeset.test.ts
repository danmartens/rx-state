import { diffObjects } from '../diffObjects';
import { formatChangeset } from '../formatChangeset';

describe('formatChangeset', () => {
  test('formats changesets', () => {
    const changeset = diffObjects({ a: 1 }, { a: 2 });

    expect(formatChangeset(changeset)).toEqual(`a: 1 => 2`);
  });

  test('formats changesets (nested)', () => {
    const changeset = diffObjects({ a: { b: 1 } }, { a: { b: 2 } });

    expect(formatChangeset(changeset)).toEqual('a: \n  b: 1 => 2');
  });

  test('formats changesets (deeply nested)', () => {
    const changeset = diffObjects(
      { a: { b: { c: 1 } } },
      { a: { b: { c: 2 } } },
    );

    expect(formatChangeset(changeset)).toEqual('a: \n  b: \n    c: 1 => 2');
  });
});
