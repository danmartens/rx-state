export const union = <T>(
  target: ReadonlyArray<T>,
  source: ReadonlyArray<T>,
): ReadonlyArray<T> => {
  if (target === source) {
    return target;
  }

  if (source.every((item) => target.includes(item))) {
    return target;
  }

  return Array.from(new Set([...target, ...source]));
};
