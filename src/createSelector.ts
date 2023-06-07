export function createSelector<TState extends object, TResult>(
  selector: (state: TState) => TResult
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, TResult>(
  input1: (state: TState) => V1,
  selector: (input1: V1) => TResult
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, V2, TResult>(
  input1: (state: TState) => V1,
  input2: (state: TState) => V2,
  selector: (input1: V1, input2: V2) => TResult
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, V2, V3, TResult>(
  input1: (state: TState) => V1,
  input2: (state: TState) => V2,
  input3: (state: TState) => V3,
  selector: (input1: V1, input2: V2, input3: V3) => TResult
): (state: TState) => TResult;

export function createSelector<TState extends object, V1, V2, V3, TResult>(
  arg1: ((state: TState) => TResult) | ((state: TState) => V1),
  arg2?: ((input1: V1) => TResult) | ((state: TState) => V2),
  arg3?: ((input1: V1, input2: V2) => TResult) | ((state: TState) => V3),
  arg4?: (input1: V1, input2: V2, input3: V3) => TResult
) {
  const results = new WeakMap<TState, TResult>();

  if (arg4 !== undefined) {
    const input1 = arg1 as (state: TState) => V1;
    const input2 = arg2 as (state: TState) => V2;
    const input3 = arg3 as (state: TState) => V3;
    const selector = arg4;

    return (state: TState) => {
      if (!results.has(state)) {
        results.set(
          state,
          selector(input1(state), input2(state), input3(state))
        );
      }

      return results.get(state) as TResult;
    };
  } else if (arg3 !== undefined) {
    const input1 = arg1 as (state: TState) => V1;
    const input2 = arg2 as (state: TState) => V2;
    const selector = arg3 as (input1: V1, input2: V2) => TResult;

    return (state: TState) => {
      if (!results.has(state)) {
        results.set(state, selector(input1(state), input2(state)));
      }

      return results.get(state) as TResult;
    };
  } else if (arg2 !== undefined) {
    const input1 = arg1 as (state: TState) => V1;
    const selector = arg2 as (input1: V1) => TResult;

    return (state: TState) => {
      if (!results.has(state)) {
        results.set(state, selector(input1(state)));
      }

      return results.get(state) as TResult;
    };
  } else {
    const selector = arg1 as (state: TState) => TResult;

    return (state: TState) => {
      if (!results.has(state)) {
        results.set(state, selector(state));
      }

      return results.get(state) as TResult;
    };
  }
}
