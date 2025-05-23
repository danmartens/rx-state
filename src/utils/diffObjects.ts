/* eslint-disable @typescript-eslint/ban-ts-comment */

import { isObject } from './isObject';

export type Changeset<T extends Record<string, unknown>> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? Changeset<T[K]>
    : [T[K], T[K]];
};

export const diffObjects = <T extends Readonly<Record<string, unknown>>>(
  objectA: T,
  objectB: T
): Changeset<T> => {
  const changes: Changeset<T> = {};

  for (const key of Object.keys(objectA)) {
    if (objectA[key] !== objectB[key]) {
      if (isObject(objectA[key]) && isObject(objectB[key])) {
        // @ts-expect-error
        changes[key as keyof T] = diffObjects(
          // @ts-expect-error
          objectA[key] as T[typeof key],
          objectB[key] as T[typeof key]
        );
      } else {
        // @ts-expect-error
        changes[key as keyof T] = [
          objectA[key] as T[typeof key],
          objectB[key] as T[typeof key],
        ];
      }
    }
  }

  for (const key of Object.keys(objectB)) {
    if (objectA[key] === undefined) {
      // @ts-expect-error
      changes[key as keyof T] = [
        objectA[key] as T[typeof key],
        objectB[key] as T[typeof key],
      ];
    }
  }

  return changes;
};
