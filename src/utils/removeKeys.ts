export const removeKeys = <T extends Record<string, any>>(
  target: T,
  keys: Array<keyof T>,
): T => {
  if (!keys.some((key) => key in target)) {
    return target;
  }

  return Object.fromEntries(
    Object.entries(target).filter(([key]) => !keys.includes(key)),
  ) as T;
};
