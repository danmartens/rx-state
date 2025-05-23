export const map = <T>(
  target: ReadonlyArray<T>,
  updater: (item: T, index: number) => T,
): ReadonlyArray<T> => {
  let modified = false;

  const result: Array<T> = [];

  let index = 0;

  for (const item of target) {
    const updated = updater(item, index);

    if (updated !== item) {
      modified = true;
    }

    result.push(updated);

    index++;
  }

  return modified ? result : target;
};
