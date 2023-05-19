export const splice = <T>(
  target: ReadonlyArray<T>,
  start: number,
  deleteCount?: number,
  ...items: Array<T>
): ReadonlyArray<T> => {
  if (deleteCount === 0 && items.length === 0) {
    return target;
  }

  if (start == null) {
    throw new Error('The "start" argument is required');
  }

  if (start < 0) {
    start = target.length + start;
  }

  if (start < 0) {
    start = 0;
  }

  if (start > target.length) {
    start = target.length;
  }

  if (deleteCount == null || deleteCount < 0) {
    deleteCount = 0;
  }

  if (start + deleteCount > target.length) {
    deleteCount = target.length - start;
  }

  const result: Array<T> = target.slice(0, start);

  result.push(...items);

  if (deleteCount == null) {
    result.push(...target.slice(start));
  } else {
    result.push(...target.slice(start + deleteCount));
  }

  return result;
};
