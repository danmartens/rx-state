import { getIn } from './getIn';
import { setIn } from './setIn';

type Updater<T> = (value: T) => T;

export function updateIn<T extends Record<string, unknown>, K1 extends keyof T>(
  target: T,
  key1: K1,
  updater: Updater<T[K1]>,
): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
>(target: T, key1: K1, key2: K2, updater: Updater<T[K1][K2]>): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
>(target: T, key1: K1, key2: K2, key3: K3, updater: Updater<T[K1][K2][K3]>): T;

export function updateIn<
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
  updater: Updater<T[K1][K2][K3][K4]>,
): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
>(
  target: T,
  arg1: K1,
  arg2: K2 | Updater<T[K1]>,
  arg3?: K3 | Updater<T[K1][K2]>,
  arg4?: K4 | Updater<T[K1][K2][K3]>,
  arg5?: Updater<T[K1][K2][K3][K4]>,
): T;

export function updateIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
>(
  target: T,
  arg1: K1,
  arg2: K2 | Updater<T[K1]>,
  arg3?: K3 | Updater<T[K1][K2]>,
  arg4?: K4 | Updater<T[K1][K2][K3]>,
  arg5?: Updater<T[K1][K2][K3][K4]>,
): T {
  const key1 = arg1;

  if (typeof arg2 === 'function') {
    const update = arg2;

    return setIn(target, key1, update(getIn(target, arg1)));
  }

  const key2 = arg2 as K2;

  if (typeof arg3 === 'function') {
    const update = arg3;

    return setIn(target, key1, key2, update(getIn(target, key1, key2)));
  }

  const key3 = arg3 as K3;

  if (typeof arg4 === 'function') {
    const update = arg4;

    return setIn(
      target,
      key1,
      key2,
      key3,
      update(getIn(target, key1, key2, key3)),
    );
  }

  const key4 = arg4 as K4;

  if (typeof arg5 === 'function') {
    const update = arg5;

    return setIn(
      target,
      key1,
      key2,
      key3,
      key4,
      update(getIn(target, key1, key2, key3, key4)),
    );
  }

  throw new Error('The last argument to updateIn must be an updater function');
}
