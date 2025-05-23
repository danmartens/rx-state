type ImmutableRecord<T = unknown> = Readonly<Record<string, T>>;
type ImmutableArray<T = unknown> = ReadonlyArray<T>;

export function set<T extends ImmutableRecord, K extends keyof T>(
  target: T,
  key: K,
  value: T[K],
): T;

export function set<T extends ImmutableArray, K extends keyof T>(
  target: T,
  key: K,
  value: T[K],
): T;

export function set<
  T extends ImmutableRecord | ImmutableArray,
  K extends keyof T,
>(target: T, key: K, value: T[K]): T;

export function set<
  T extends ImmutableRecord | ImmutableArray,
  K extends keyof T,
>(target: T, key: K, value: T[K]): T {
  if (target[key] === value) {
    return target;
  }

  if (Array.isArray(target)) {
    const result = [...target];

    result[key as number] = value;

    return result as unknown as T;
  } else {
    return {
      ...target,
      [key]: value,
    };
  }
}
