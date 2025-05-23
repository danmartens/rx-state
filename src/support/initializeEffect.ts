import { Observable, Subject, filter } from 'rxjs';

import type { Action, ActionOfType, Effect } from '../types';

export const initializeEffect = <
  TAction extends Action,
  TState,
  TDependencies extends Record<string, unknown>,
>(
  effect: Effect<TAction, TState, TDependencies>,
  state$: Observable<TState>,
  dependencies: TDependencies,
) => {
  const input$ = new Subject<TAction>();
  const output$ = effect(input$, state$, dependencies);

  /**
   * Dispatches an action during the next event loop.
   * @example
   * const {
   *   dispatch,
   *   nextAction
   * } = initializeEffect(effect, state$, dependencies);
   *
   * dispatch(inputAction);
   *
   * const outputAction = await nextAction();
   */
  const dispatch = (action: TAction) => {
    queueMicrotask(() => {
      input$.next(action);
    });
  };

  /**
   * Dispatches an action during the current event loop. This should only be
   * used to test input actions that don't have a corresponding output action.
   */
  const dispatchImmediately = (action: TAction) => {
    let outputError;

    // Since Observables are lazy, we need to subscribe to the output$ stream
    // before dispatching the action.
    const subscription = output$.subscribe({
      error: (error) => {
        outputError = error;
      },
    });

    input$.next(action);

    subscription.unsubscribe();

    if (outputError != null) {
      throw outputError;
    }
  };

  /**
   * Returns a `Promise` that resolves with the next action dispatched by the
   * `Effect`. Accepts an optional `predicate` to filter for the desired action.
   */
  const nextAction = (
    predicate: (action: TAction) => boolean = () => true,
  ): Promise<TAction> => {
    return new Promise((resolve, reject) => {
      const subscription = output$.subscribe({
        next: (value) => {
          if (!predicate(value)) {
            return;
          }

          queueMicrotask(() => {
            subscription.unsubscribe();
          });

          resolve(value);
        },
        error: reject,
      });
    });
  };

  /**
   * Returns a `Promise` that resolves with the next action of type `actionType`
   * dispatched by the `Effect`.
   */
  const nextActionOfType = <TType extends TAction['type']>(
    actionType: TType,
  ): Promise<ActionOfType<TAction, TType>> => {
    return new Promise((resolve, reject) => {
      const subscription = output$
        .pipe(filter((action) => action.type === actionType))
        .subscribe({
          next: (value) => {
            queueMicrotask(() => {
              subscription.unsubscribe();
            });

            resolve(value as ActionOfType<TAction, TType>);
          },
          error: reject,
        });
    });
  };

  return {
    dispatch,
    dispatchImmediately,
    nextAction,
    nextActionOfType,
  };
};
