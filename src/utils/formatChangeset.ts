import { Changeset } from './diffObjects';

export const formatChangeset = (
  changeset: Changeset<any> | [unknown, unknown],
  depth = 0
): string => {
  if (Array.isArray(changeset)) {
    return `${JSON.stringify(changeset[0])} => ${JSON.stringify(changeset[1])}`;
  } else {
    return Object.entries(changeset).reduce((acc, [key, value], index) => {
      if (value == null) {
        return acc;
      }

      return (
        acc +
        `${depth > 0 || index > 0 ? '\n' : ''}${indent(
          depth
        )}${key}: ${formatChangeset(value, depth + 1)}`
      );
    }, '');
  }
};

const indent = (depth: number) => new Array(depth).fill('  ').join('');
