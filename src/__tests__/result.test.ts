import { error, ok } from '../result';

describe('Result', () => {
  describe('equalTo', () => {
    test('ok', () => {
      expect(ok(1).equalTo(ok(1))).toBe(true);

      expect(ok(1).equalTo(ok(2))).toBe(false);
    });

    test('error', () => {
      const value = new Error('Test error');

      expect(error(value).equalTo(error(value))).toBe(true);

      expect(error(value).equalTo(error(new Error('Other test error')))).toBe(
        false
      );
    });
  });
});
