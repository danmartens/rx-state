import { Observable, Subject, filter } from 'rxjs';

import { Action, ActionOfType, Effect } from '../types';

export const initializeEffect = <
  TAction extends Action,
  TState,
  TDependencies extends Record<string, unknown>
>(
  effect: Effect<TAction, TState, TDependencies>,
  state$: Observable<TState>,
  dependencies: TDependencies
) => {
  const input$ = new Subject<TAction>();
  const output$ = effect(input$, state$, dependencies);

  const dispatch = (action: TAction) => {
    queueMicrotask(() => {
      input$.next(action);
    });
  };

  const nextAction = (
    predicate: (action: TAction) => boolean = () => true
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

  const nextActionOfType = <T extends Action['type']>(
    actionType: T
  ): Promise<ActionOfType<T>> => {
    return new Promise((resolve, reject) => {
      const subscription = output$
        .pipe(filter((action) => action.type === actionType))
        .subscribe({
          next: (value) => {
            queueMicrotask(() => {
              subscription.unsubscribe();
            });

            resolve(value as ActionOfType<T>);
          },
          error: reject,
        });
    });
  };

  return {
    dispatch,
    nextAction,
    nextActionOfType,
  };
};
