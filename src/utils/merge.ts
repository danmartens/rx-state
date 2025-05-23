export const merge = <T extends Record<string, unknown>, S extends Partial<T>>(
  target: T,
  source: S,
): T => {
  if (Object.keys(source).length === 0) {
    return target;
  }

  if (
    Object.keys(target).some(
      (key) => source[key] !== undefined && source[key] !== target[key],
    ) ||
    Object.keys(source).some(
      (key) => source[key] !== undefined && target[key] === undefined,
    )
  ) {
    return {
      ...target,
      ...source,
    };
  }

  return target;
};
