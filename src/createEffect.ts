import {
  Observable,
  catchError,
  from,
  map,
  mergeMap,
  of,
  withLatestFrom,
} from 'rxjs';
import { Action } from './types';
import { ofType } from './ofType';
import { createStore } from './createStore';

export function createEffect<
  TInput extends Action,
  const TType extends Action['type'],
  TOutput extends TInput = Extract<TInput, Action<TType>>,
  TEffect extends (action: TOutput) => PromiseLike<TInput> = (
    action: TOutput
  ) => PromiseLike<TInput>
>(
  type: TType,
  effect: TEffect
): (action$: Observable<TInput>) => Observable<TInput> {
  return (action$) =>
    action$.pipe(
      ofType<TInput, TType, TOutput>(type),
      mergeMap((action) => from(effect(action)))
    );
}

type State = Record<string, { id: string }>;

type SaveLayout = {
  type: 'SAVE_TYPE_SPECIMEN_LAYOUT';
  data: { id: string };
};

type SaveLayoutSuccess = {
  type: 'SAVE_TYPE_SPECIMEN_LAYOUT_SUCCESS';
};

type SaveLayoutError = {
  type: 'SAVE_TYPE_SPECIMEN_LAYOUT_ERROR';
};

const reducer = (
  state: State,
  action: SaveLayout | SaveLayoutSuccess | SaveLayoutError
) => {
  return state;
};

createStore(reducer, [
  createEffect('SAVE_TYPE_SPECIMEN_LAYOUT', async (action) => {
    try {
      const data = await fetch('/api/specimens').then((response) =>
        response.json()
      );

      return {
        type: 'SAVE_TYPE_SPECIMEN_LAYOUT_SUCCESS',
      };
    } catch (error) {
      console.error(error);

      return {
        type: 'SAVE_TYPE_SPECIMEN_LAYOUT_ERROR',
      };
    }
  }),
]);
