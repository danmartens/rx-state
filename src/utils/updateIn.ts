import { getIn } from './getIn';
import { setIn } from './setIn';

type Updater<T> = (value: T) => T;

export function updateIn<T extends Record<string, unknown>, K1 extends keyof T>(
  target: T,
  keys: [K1],
  updater: Updater<T[K1]>
): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1]
>(target: T, keys: [K1, K2], updater: Updater<T[K1][K2]>): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(target: T, keys: [K1, K2, K3], updater: Updater<T[K1][K2][K3]>): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(target: T, keys: [K1, K2, K3, K4], updater: Updater<T[K1][K2][K3][K4]>): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(
  target: T,
  keys: [K1] | [K1, K2] | [K1, K2, K3] | [K1, K2, K3, K4],
  updater: Updater<T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4]>
): T {
  switch (keys.length) {
    case 1: {
      return setIn(
        target,
        keys,
        updater(getIn(target, keys)) as unknown as T[K1]
      );
    }

    case 2: {
      return setIn(
        target,
        keys,
        updater(getIn(target, keys)) as unknown as T[K1][K2]
      );
    }

    case 3: {
      return setIn(
        target,
        keys,
        updater(getIn(target, keys)) as unknown as T[K1][K2][K3]
      );
    }

    case 4: {
      return setIn(
        target,
        keys,
        updater(getIn(target, keys)) as unknown as T[K1][K2][K3][K4]
      );
    }
  }
}
