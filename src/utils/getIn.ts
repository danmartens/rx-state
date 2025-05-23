export function getIn<T, K1 extends keyof T>(target: T, arg1: K1): T[K1];

export function getIn<T, K1 extends keyof T, K2 extends keyof T[K1]>(
  target: T,
  arg1: K1,
  arg2?: K2,
): T[K1][K2];

export function getIn<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
>(target: T, arg1: K1, arg2?: K2, arg3?: K3): T[K1][K2][K3];

export function getIn<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
>(target: T, arg1: K1, arg2?: K2, arg3?: K3, arg4?: K4): T[K1][K2][K3][K4];

export function getIn<
  T,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3],
>(
  target: T,
  arg1: K1,
  arg2?: K2,
  arg3?: K3,
  arg4?: K4,
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
  if (arg2 == null) {
    return target[arg1];
  }

  if (arg3 == null) {
    return target[arg1][arg2];
  }

  if (arg4 == null) {
    return target[arg1][arg2][arg3];
  }

  return target[arg1][arg2][arg3][arg4];
}
