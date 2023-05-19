import { getIn } from './getIn';

export function setIn<T extends Record<string, unknown>, K1 extends keyof T>(
  target: T,
  keys: [K1],
  value: T[K1]
): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1]
>(target: T, keys: [K1, K2], value: T[K1][K2]): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(target: T, keys: [K1, K2, K3], value: T[K1][K2][K3]): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(
  target: T,
  keys: [K1] | [K1, K2] | [K1, K2, K3],
  value: T[K1] | T[K1][K2] | T[K1][K2][K3]
): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(
  target: T,
  keys: [K1] | [K1, K2] | [K1, K2, K3] | [K1, K2, K3, K4],
  value: T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4]
): T;

export function setIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(
  target: T,
  keys: [K1] | [K1, K2] | [K1, K2, K3] | [K1, K2, K3, K4],
  value: T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4]
): T {
  switch (keys.length) {
    case 1: {
      if (getIn(target, keys) === value) {
        return target;
      }

      return {
        ...target,
        [keys[0]]: value,
      };
    }

    case 2: {
      if (getIn(target, keys) === value) {
        return target;
      }

      const nested = target[keys[0]];

      if (isRecord(nested)) {
        return {
          ...target,
          [keys[0]]: {
            ...nested,
            [keys[1]]: value,
          },
        };
      }

      throw new Error('Cannot setIn on non-record');
    }

    case 3: {
      if (getIn(target, keys) === value) {
        return target;
      }

      const v1 = target[keys[0]];

      if (isRecord(v1)) {
        const v2 = v1[keys[1]];

        if (isRecord(v2)) {
          return {
            ...target,
            [keys[0]]: {
              ...v1,
              [keys[1]]: {
                ...v2,
                [keys[2]]: value,
              },
            },
          };
        }
      }

      throw new Error('Cannot setIn on non-record');
    }

    case 4: {
      if (getIn(target, keys) === value) {
        return target;
      }

      const v1 = target[keys[0]];

      if (isRecord(v1)) {
        const v2 = v1[keys[1]];

        if (isRecord(v2)) {
          const v3 = v2[keys[2]];

          if (isRecord(v3)) {
            return {
              ...target,
              [keys[0]]: {
                ...v1,
                [keys[1]]: {
                  ...v2,
                  [keys[2]]: {
                    ...v3,
                    [keys[3]]: value,
                  },
                },
              },
            };
          }
        }
      }

      throw new Error('Cannot setIn on non-record');
    }
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};
