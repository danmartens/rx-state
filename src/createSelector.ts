/**
 * Creates a memoized selector function with up to three inputs that are also
 * memoized. The selector function (always the final argument) is only called
 * when the inputs change.
 *
 * This is useful for creating functions that derive values from store state.
 * It's designed to be used with the `useSelector()` hook that is created via
 * `createStoreContext()`.
 *
 * Because the selector function passed to the `useSelector()` hook is called on
 * every render and it causes the containing component to re-render when its
 * return value changes, it's important to memoize the selector function if it
 * is deriving a value from the store state.
 *
 * A selector function that is only used to extract a subset of the store state
 * should not be memoized via this function. For example:
 *
 * ```tsx
 * const Session = () => {
 *   const currentUser = useSelector((state: State) => state.currentUser);
 *
 *   // ...
 * }
 * ```
 *
 * The selector above does not need to be memoized via `createSelector()`. In
 * fact, passing it into `createSelector()` will only add unnecessary overhead
 * since the result of the selector function is already an immutable value.
 *
 * However, if the selector function is deriving a value from the store state,
 * the result of the selector function may never be referentially the same if
 * the value is non-primitive. For example:
 *
 * ```tsx
 * const ActiveUsers = () => {
 *   const activeUsers = useSelector((state: State) =>
 *     state.users.filter(user => user.isActive)
 *   );
 *
 *   // ...
 * }
 * ```
 *
 * The selector above will return a new array every time any part of the state
 * changes. This will cause the `ActiveUsers` component to re-render every time
 * the state changes, even if the array of users is the same as it was before
 * the state change.
 *
 * We can improve this using `createSelector()`:
 *
 * ```tsx
 * const getActiveUsers = createSelector(
 *   (state: State) => state.users,
 *   (users) => users.filter(user => user.isActive)
 * );
 *
 * const ActiveUsers = () => {
 *   const activeUsers = useSelector(getActiveUsers);
 *
 *   // ...
 * }
 * ```
 *
 * Now, the `ActiveUsers` component will only re-render when the array of users
 * actually changes.
 */
export function createSelector<TState extends object, TResult>(
  selector: (state: TState) => TResult,
  options?: Options
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, TResult>(
  input1: (state: TState) => V1,
  selector: (input1: V1) => TResult,
  options?: Options
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, V2, TResult>(
  input1: (state: TState) => V1,
  input2: (state: TState) => V2,
  selector: (input1: V1, input2: V2) => TResult,
  options?: Options
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, V2, V3, TResult>(
  input1: (state: TState) => V1,
  input2: (state: TState) => V2,
  input3: (state: TState) => V3,
  selector: (input1: V1, input2: V2, input3: V3) => TResult,
  options?: Options
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, V2, V3, TResult>(
  arg1: ((state: TState) => TResult) | ((state: TState) => V1),
  arg2?: ((input1: V1) => TResult) | ((state: TState) => V2) | Options,
  arg3?:
    | ((input1: V1, input2: V2) => TResult)
    | ((state: TState) => V3)
    | Options,
  arg4?: ((input1: V1, input2: V2, input3: V3) => TResult) | Options,
  arg5?: Options
) {
  const v1Results = new WeakMap<TState, V1>();
  const v2Results = new WeakMap<TState, V2>();
  const v3Results = new WeakMap<TState, V3>();

  const results = new WeakMap<TState, TResult>();

  if (typeof arg4 === 'function') {
    const input1 = arg1 as (state: TState) => V1;
    const input2 = arg2 as (state: TState) => V2;
    const input3 = arg3 as (state: TState) => V3;
    const selector = arg4;
    const options = arg5;

    return (state: TState) => {
      if (results.has(state)) {
        return results.get(state) as TResult;
      }

      let start: ReturnType<typeof performance.now> | undefined;

      if (
        process.env.NODE_ENV !== 'production' &&
        typeof performance !== 'undefined' &&
        options?.measure != null
      ) {
        start = performance.now();
      }

      if (!v1Results.has(state)) {
        v1Results.set(state, input1(state));
      }

      if (!v2Results.has(state)) {
        v2Results.set(state, input2(state));
      }

      if (!v3Results.has(state)) {
        v3Results.set(state, input3(state));
      }

      results.set(
        state,
        selector(
          v1Results.get(state) as V1,
          v2Results.get(state) as V2,
          v3Results.get(state) as V3
        )
      );

      if (
        process.env.NODE_ENV !== 'production' &&
        typeof performance !== 'undefined' &&
        options?.measure != null
      ) {
        performance.measure(options.measure.name, {
          start,
        });
      }

      return results.get(state) as TResult;
    };
  } else if (typeof arg3 === 'function') {
    const input1 = arg1 as (state: TState) => V1;
    const input2 = arg2 as (state: TState) => V2;
    const selector = arg3 as (input1: V1, input2: V2) => TResult;
    const options = arg4;

    return (state: TState) => {
      if (results.has(state)) {
        return results.get(state) as TResult;
      }

      let start: ReturnType<typeof performance.now> | undefined;

      if (
        process.env.NODE_ENV !== 'production' &&
        typeof performance !== 'undefined' &&
        options?.measure != null
      ) {
        start = performance.now();
      }

      if (!v1Results.has(state)) {
        v1Results.set(state, input1(state));
      }

      if (!v2Results.has(state)) {
        v2Results.set(state, input2(state));
      }

      results.set(
        state,
        selector(v1Results.get(state) as V1, v2Results.get(state) as V2)
      );

      if (
        process.env.NODE_ENV !== 'production' &&
        typeof performance !== 'undefined' &&
        options?.measure != null
      ) {
        performance.measure(options.measure.name, {
          start,
        });
      }

      return results.get(state) as TResult;
    };
  } else if (typeof arg2 === 'function') {
    const input1 = arg1 as (state: TState) => V1;
    const selector = arg2 as (input1: V1) => TResult;
    const options = arg3;

    return (state: TState) => {
      if (results.has(state)) {
        return results.get(state) as TResult;
      }

      let start: ReturnType<typeof performance.now> | undefined;

      if (
        process.env.NODE_ENV !== 'production' &&
        typeof performance !== 'undefined' &&
        options?.measure != null
      ) {
        start = performance.now();
      }

      if (!v1Results.has(state)) {
        v1Results.set(state, input1(state));
      }

      if (
        process.env.NODE_ENV !== 'production' &&
        typeof performance !== 'undefined' &&
        options?.measure != null
      ) {
        performance.measure(options.measure.name, {
          start,
        });
      }

      results.set(state, selector(v1Results.get(state) as V1));

      return results.get(state) as TResult;
    };
  } else {
    const selector = arg1 as (state: TState) => TResult;
    const options = arg2;

    return (state: TState) => {
      if (!results.has(state)) {
        let start: ReturnType<typeof performance.now> | undefined;

        if (
          process.env.NODE_ENV !== 'production' &&
          typeof performance !== 'undefined' &&
          options?.measure != null
        ) {
          start = performance.now();
        }
        results.set(state, selector(state));

        if (
          process.env.NODE_ENV !== 'production' &&
          typeof performance !== 'undefined' &&
          options?.measure != null
        ) {
          performance.measure(options.measure.name, {
            start,
          });
        }
      }

      return results.get(state) as TResult;
    };
  }
}

interface Options {
  measure?: {
    name: string;
  };
}
