export type Defined<T> = T extends undefined ? never : T;

export function isDefined<T>(value: T): value is Defined<T> {
  return value !== undefined;
}
