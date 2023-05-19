export function getIn<T extends Record<string, unknown>, K1 extends keyof T>(
  target: T,
  keys: [K1]
): T[K1];

export function getIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1]
>(target: T, keys: [K1, K2]): T[K1][K2];

export function getIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2]
>(target: T, keys: [K1, K2, K3]): T[K1][K2][K3];

export function getIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(target: T, keys: [K1, K2, K3, K4]): T[K1][K2][K3][K4];

export function getIn<
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T[K1],
  K3 extends keyof T[K1][K2],
  K4 extends keyof T[K1][K2][K3]
>(
  target: T,
  keys: [K1] | [K1, K2] | [K1, K2, K3] | [K1, K2, K3, K4]
): T[K1] | T[K1][K2] | T[K1][K2][K3] | T[K1][K2][K3][K4] {
  switch (keys.length) {
    case 1: {
      return target[keys[0]];
    }

    case 2: {
      return target[keys[0]][keys[1]];
    }

    case 3: {
      return target[keys[0]][keys[1]][keys[2]];
    }

    case 4: {
      return target[keys[0]][keys[1]][keys[2]][keys[3]];
    }
  }
}
