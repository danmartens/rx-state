import { filter, map, tap } from 'rxjs';

import { createStore } from '../createStore';
import { createDispatcher } from '../createDispatcher';

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

    const subscription = store.subscribe({ next: () => {} });

    store.next({ type: 'INCREMENT' });
    store.next({ type: 'INCREMENT' });

    expect(store.getState()).toEqual(44);

    subscription.unsubscribe();
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

  test('multiple stores can share a single dispatcher', () => {
    const actions$ = createDispatcher<{ type: 'INCREMENT' }>();

    const storeFactory = createStore(
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state,
      [],
      actions$
    );

    const store1 = storeFactory(42, {});
    const store2 = storeFactory(24, {});

    const subscription1 = store1.subscribe({ next: () => {} });
    const subscription2 = store2.subscribe({ next: () => {} });

    actions$.next({ type: 'INCREMENT' });

    expect(store1.getState()).toEqual(43);
    expect(store2.getState()).toEqual(25);

    subscription1.unsubscribe();
    subscription2.unsubscribe();

    actions$.next({ type: 'INCREMENT' });

    expect(store1.getState()).toEqual(43);
    expect(store2.getState()).toEqual(25);
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

      const subscription = store.subscribe({ next: () => {} });

      store.next({ type: 'PING' });
      expect(store.getState()).toEqual(['PING', 'PONG']);

      subscription.unsubscribe();

      store.next({ type: 'PING' });
      expect(store.getState()).toEqual(['PING', 'PONG']);
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

      const subscription1 = store.subscribe({ next: () => {} });
      const subscription2 = store.subscribe({ next: () => {} });

      store.next({ type: 'PING' });
      expect(store.getState()).toEqual(['PING', 'PONG']);

      subscription1.unsubscribe();

      store.next({ type: 'PING' });
      expect(store.getState()).toEqual(['PING', 'PONG', 'PING', 'PONG']);

      subscription2.unsubscribe();

      store.next({ type: 'PING' });
      expect(store.getState()).toEqual(['PING', 'PONG', 'PING', 'PONG']);
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
