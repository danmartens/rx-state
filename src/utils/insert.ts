import { splice } from './splice';

export const insert = <T>(
  target: ReadonlyArray<T>,
  index: number,
  value: T,
): ReadonlyArray<T> => {
  return splice(target, index, 0, value);
};
