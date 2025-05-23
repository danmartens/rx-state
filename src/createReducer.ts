import { Action } from './types';

type Reducer<TState, TAction extends Action> = (
  state: TState,
  action: TAction,
) => TState;

export const createReducer =
  <TState, TAction extends Action>(
    reducers: Partial<{
      [TType in TAction['type']]: Reducer<
        Readonly<TState>,
        Extract<TAction, { type: TType }>
      >;
    }>,
  ) =>
  (state: TState, action: TAction): TState => {
    const reducer = reducers[action.type as TAction['type']];

    if (reducer != null) {
      return reducer(
        state,
        action as Extract<TAction, { type: typeof action.type }>,
      );
    }

    return state;
  };
