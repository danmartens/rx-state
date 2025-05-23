import { OperatorFunction, filter } from 'rxjs';

import { Action } from './types';

// Sourced from: https://github.com/redux-observable/redux-observable/blob/master/src/operators.ts

const keyHasType = (type: unknown, key: unknown) => {
  return type === key || (typeof key === 'function' && type === key.toString());
};

/**
 * Inferring the types of this is a bit challenging, and only works in newer
 * versions of TypeScript.
 *
 * @param ...types One or more Redux action types you want to filter for, variadic.
 */
export function ofType<
  // All possible actions your app can dispatch
  TInput extends Action,
  // The types you want to filter for
  TType extends TInput['type'],
  // The resulting actions that match the above types
  TOutput extends TInput = Extract<TInput, Action<TType>>,
>(...types: [TType, ...TType[]]): OperatorFunction<TInput, TOutput> {
  const count = types.length;

  if (process.env.NODE_ENV !== 'production') {
    if (count === 0) {
      console.warn('ofType was called without any types!');
    }

    if (types.some((key) => key === null || key === undefined)) {
      console.warn(
        'ofType was called with one or more undefined or null values!',
      );
    }
  }

  return filter(
    count === 1
      ? (action): action is TOutput => keyHasType(action.type, types[0])
      : (action): action is TOutput => {
          for (let i = 0; i < count; i++) {
            if (keyHasType(action.type, types[i])) {
              return true;
            }
          }

          return false;
        },
  );
}
