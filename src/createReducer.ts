import { Action } from './types';

type Reducer<TState, TAction extends Action> = (
  state: TState,
  action: TAction
) => TState;

export const createReducer =
  <TState, TAction extends Action>(reducers: {
    [TType in TAction['type']]: Reducer<
      Readonly<TState>,
      Extract<TAction, { type: TType }>
    >;
  }) =>
  (state: TState, action: TAction): TState => {
    if (action.type in reducers) {
      return reducers[action.type as TAction['type']](
        state,
        action as Extract<TAction, { type: typeof action.type }>
      );
    }

    return state;
  };
