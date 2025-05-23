import { isObject } from './isObject';

export function setIn<T extends Record<string, unknown>, K1 extends keyof T>(
  target: T,
  key1: K1,
  value: T[K1],
): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
>(target: T, key1: K1, key2: K2, value: T[K1][K2]): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
>(target: T, key1: K1, key2: K2, key3: K3, value: T[K1][K2][K3]): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
>(
  target: T,
  key1: K1,
  key2: K2,
  key3: K3,
  key4: K4,
  value: T[K1][K2][K3][K4],
): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
>(
  target: T,
  arg1: K1,
  arg2: K2 | T[K1],
  arg3?: K3 | T[K1][K2],
  arg4?: K4 | T[K1][K2][K3],
  arg5?: T[K1][K2][K3][K4],
): T {
  assertObject(target);

  const key1 = arg1;

  if (arg3 == null) {
    const value = arg2;

    if (target[key1] === value) {
      return target;
    }

    return {
      ...target,
      [key1]: value,
    };
  }

  const record1 = target[key1];

  assertObject(record1, key1);

  const key2 = arg2 as K2;

  if (arg4 == null) {
    const value = arg3;

    if (record1[key2] === value) {
      return target;
    }

    return {
      ...target,
      [key1]: {
        ...record1,
        [key2]: value,
      },
    };
  }

  const record2 = record1[key2];

  assertObject(record2, key1, key2);

  const key3 = arg3 as K3;

  if (arg5 == null) {
    const value = arg4;

    if (record2[key3] === value) {
      return target;
    }

    return {
      ...target,
      [key1]: {
        ...record1,
        [key2]: {
          ...record2,
          [key3]: value,
        },
      },
    };
  }

  const record3 = record2[key3];

  assertObject(record3, key1, key2, key3);

  const key4 = arg4 as K4;
  const value = arg5;

  if (record3[key4] === value) {
    return target;
  }

  return {
    ...target,
    [key1]: {
      ...record1,
      [key2]: {
        ...record2,
        [key3]: {
          ...record3,
          [key4]: value,
        },
      },
    },
  };
}

function assertObject(
  value: unknown,
  ...keyPath: Array<string | number | symbol>
): asserts value is Record<string, unknown> {
  if (!isObject(value)) {
    if (keyPath.length > 0) {
      throw new TypeError(
        `Value at key path "${keyPath.join(
          '.',
        )}" is a ${typeof value} and therefore cannot be updated via setIn`,
      );
    }

    throw new TypeError(
      'Target is not an object and therefore cannot be updated via setIn',
    );
  }
}
