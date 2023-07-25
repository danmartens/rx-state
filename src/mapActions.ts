import { EMPTY, Observable, OperatorFunction, mergeMap, of } from 'rxjs';

import { Action, ActionOfType } from './types';

export const mapActions =
  <
    TAction extends Action,
    TMap extends {
      [K in TAction['type']]?: (action: ActionOfType<TAction, K>) => TAction;
    }
  >(
    actionMap: TMap
  ): OperatorFunction<TAction, TAction> =>
  (action$: Observable<TAction>) =>
    action$.pipe(
      mergeMap((action) => {
        const mapFn = actionMap[action.type as TAction['type']];

        if (mapFn != null) {
          return of(mapFn(action));
        }

        return EMPTY;
      })
    );
