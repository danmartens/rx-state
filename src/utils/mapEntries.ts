type RecordValue<T> = T extends Record<string, infer V> ? V : never;

export const mapEntries = <T extends Readonly<Record<string, any>>>(
  target: T,
  updater: (entry: [keyof T, RecordValue<T>]) => RecordValue<T>,
): T => {
  let modified = false;

  const entries = Object.entries(target).map(([key, value]) => {
    const updatedValue = updater([key, value]);

    if (updatedValue !== value) {
      modified = true;
    }

    return [key, updatedValue];
  });

  if (!modified) {
    return target;
  }

  return Object.fromEntries(entries) as T;
};
