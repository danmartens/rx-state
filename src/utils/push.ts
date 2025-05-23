export const push = <T>(
  target: ReadonlyArray<T>,
  value: T,
): ReadonlyArray<T> => {
  return [...target, value];
};
