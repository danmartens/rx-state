import { useCallback, useMemo } from 'react';

import { Store } from './types';

type StoreActionType<TStore> = TStore extends Store<unknown, infer TAction>
  ? TAction
  : never;

export const createActionDispatchHook = <
  TStore extends Store<unknown, any>,
  TAction extends StoreActionType<TStore> = StoreActionType<TStore>,
  TActionCreators extends Record<string, (...args: any[]) => TAction> = Record<
    string,
    (...args: any[]) => TAction
  >
>(
  actions: TActionCreators
) => {
  return (
    store: TStore
  ): {
    [K in keyof TActionCreators]: (
      ...args: Parameters<TActionCreators[K]>
    ) => void;
  } => {
    const dispatch = useCallback(
      (action: TAction) => {
        store.next(action);
      },
      [store]
    );

    return useMemo(() => {
      return Object.fromEntries(
        Object.entries(actions).map(([key, actionCreator]) => {
          return [key, (...args) => dispatch(actionCreator(...args))];
        })
      ) as {
        [K in keyof TActionCreators]: (
          ...args: Parameters<TActionCreators[K]>
        ) => void;
      };
    }, [dispatch]);
  };
};
