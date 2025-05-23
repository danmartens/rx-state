import { Observable, from, mergeMap, takeUntil, withLatestFrom } from 'rxjs';

import { Action } from './types';
import { ofType } from './ofType';

export function createCancelableEffect<
  TState,
  TInput extends Action,
  const TType extends TInput['type'],
  const TCancelType extends TInput['type'],
  TOutput extends TInput = Extract<TInput, Action<TType>>,
  TEffect extends (action: TOutput, state: TState) => PromiseLike<TInput> = (
    action: TOutput,
    state: TState,
  ) => PromiseLike<TInput>,
>(
  type: TType,
  cancelTypes: Array<TCancelType>,
  effect: TEffect,
): (
  action$: Observable<TInput | Action>,
  state$: Observable<TState>,
) => Observable<TInput> {
  return (action$, state$) =>
    action$.pipe(
      ofType<TInput | Action, TType, TOutput>(type),
      withLatestFrom(state$),
      mergeMap(([action, state]) =>
        from(effect(action, state)).pipe(
          takeUntil(
            action$.pipe(
              ofType<TInput | Action, TCancelType, TOutput>(
                cancelTypes[0],
                ...cancelTypes.slice(1),
              ),
            ),
          ),
        ),
      ),
    );
}
