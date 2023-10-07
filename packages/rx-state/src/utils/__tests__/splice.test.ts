import { splice } from '../splice';

describe('splice', () => {
  test('deletes array elements', () => {
    const spliceResult = [1, 2, 3, 4, 5];

    spliceResult.splice(2, 2);

    expect(splice([1, 2, 3, 4, 5], 2, 2)).toEqual(spliceResult);
  });

  test('inserts array elements', () => {
    const spliceResult = [1, 2, 3, 4, 5];

    spliceResult.splice(-1, 0, 6);

    expect(splice([1, 2, 3, 4, 5], -1, 0, 6)).toEqual(spliceResult);
  });
});
