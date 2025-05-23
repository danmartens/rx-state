/**
 * Returns a new array with all elements for which the predicate returns true.
 * If no elements are filtered, the original array is returned.
 */
export const filter = <T>(
  target: ReadonlyArray<T>,
  predicate: (item: T) => boolean,
): ReadonlyArray<T> => {
  let modified = false;

  const result: Array<T> = [];

  for (const item of target) {
    const include = predicate(item);

    if (include) {
      result.push(item);
    } else {
      modified = true;
    }
  }

  return modified ? result : target;
};
