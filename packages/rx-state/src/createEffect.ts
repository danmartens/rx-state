import { Observable, from, mergeMap, withLatestFrom } from 'rxjs';

import { Action } from './types';
import { ofType } from './ofType';

export function createEffect<
  TState,
  TInput extends Action,
  const TType extends Action['type'],
  TOutput extends TInput = Extract<TInput, Action<TType>>,
  TEffect extends (action: TOutput, state: TState) => PromiseLike<TInput> = (
    action: TOutput,
    state: TState
  ) => PromiseLike<TInput>
>(
  type: TType,
  effect: TEffect
): (
  action$: Observable<TInput>,
  state$: Observable<TState>
) => Observable<TInput> {
  return (action$, state$) =>
    action$.pipe(
      ofType<TInput, TType, TOutput>(type),
      withLatestFrom(state$),
      mergeMap(([action, state]) => from(effect(action, state)))
    );
}
