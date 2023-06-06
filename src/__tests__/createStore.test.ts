import { filter, map, tap } from 'rxjs';

import { createStore } from '../createStore';

type Action = { type: 'PING' } | { type: 'PONG' };

describe('createStore', () => {
  test('getState()', () => {
    const store = createStore((state, _action) => state, [])(42, {});

    expect(store.getState()).toEqual(42);
  });

  test('dispatch()', () => {
    const store = createStore(
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state,
      []
    )(42, {});

    store.next({ type: 'INCREMENT' });
    store.next({ type: 'INCREMENT' });

    expect(store.getState()).toEqual(44);
  });

  test('subscribe()', () => {
    const store = createStore((state, _action) => state, [])(42, {});

    const observer = {
      next: jest.fn(),
    };

    const subscription = store.subscribe(observer);

    store.next({ type: 'INCREMENT' });
    store.next({ type: 'INCREMENT' });

    expect(observer.next).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
  });

  describe('effects', () => {
    test('effects are only active if there is at least one subscription', () => {
      const store = createStore(
        (state: ReadonlyArray<Action['type']>, action: Action) => [
          ...state,
          action.type,
        ],
        [
          (action$) =>
            action$.pipe(
              filter((action) => action.type === 'PING'),
              map(() => ({ type: 'PONG' } satisfies Action))
            ),
        ]
      )([], {});

      store.next({ type: 'PING' });

      expect(store.getState()).toEqual(['PING']);

      const subscription = store.subscribe({ next: () => {} });

      store.next({ type: 'PING' });

      expect(store.getState()).toEqual(['PING', 'PING', 'PONG']);

      subscription.unsubscribe();
    });

    test('effects are not duplicated if there are multiple subscriptions', () => {
      const store = createStore(
        (state: ReadonlyArray<Action['type']>, action: Action) => [
          ...state,
          action.type,
        ],
        [
          (action$) =>
            action$.pipe(
              filter((action) => action.type === 'PING'),
              map(() => ({ type: 'PONG' } satisfies Action))
            ),
        ]
      )([], {});

      store.next({ type: 'PING' });

      expect(store.getState()).toEqual(['PING']);

      const subscription1 = store.subscribe({ next: () => {} });
      const subscription2 = store.subscribe({ next: () => {} });

      store.next({ type: 'PING' });

      expect(store.getState()).toEqual(['PING', 'PING', 'PONG']);

      subscription1.unsubscribe();
      subscription2.unsubscribe();
    });

    test('effects are "deactivated" if there are no more subscriptions', () => {
      const actions: Array<Action['type']> = [];

      const store = createStore(
        (state: ReadonlyArray<Action['type']>, action: Action) => [
          ...state,
          action.type,
        ],
        [
          (action$) =>
            action$.pipe(
              filter((action) => action.type === 'PING'),
              tap((action) => {
                actions.push(action.type);
              }),
              map(() => ({ type: 'PONG' } satisfies Action))
            ),
        ]
      )([], {});

      store.next({ type: 'PING' });

      expect(actions).toEqual([]);

      const subscription1 = store.subscribe({ next: () => {} });
      const subscription2 = store.subscribe({ next: () => {} });

      store.next({ type: 'PING' });

      expect(actions).toEqual(['PING']);

      subscription1.unsubscribe();

      store.next({ type: 'PING' });

      expect(actions).toEqual(['PING', 'PING']);

      subscription2.unsubscribe();

      store.next({ type: 'PING' });

      expect(actions).toEqual(['PING', 'PING']);
    });
  });
});
