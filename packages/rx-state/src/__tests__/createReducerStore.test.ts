import { filter, map, tap } from 'rxjs';

import { createReducerStore } from '../createReducerStore';
import { Action } from '../types';
import { createDispatcher } from '../createDispatcher';
import { createReducerStoreFactory } from '../createReducerStoreFactory';

describe('createReducerStore', () => {
  test('getState()', () => {
    const store = createReducerStore(42, {}, (state, _action) => state);

    expect(store.getValue()).toEqual(42);
  });

  test('dispatch()', () => {
    const store = createReducerStore(
      42,
      {},
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state
    );

    const subscription = store.subscribe({ next: () => {} });

    store.next({ type: 'INCREMENT' });
    store.next({ type: 'INCREMENT' });

    expect(store.getValue()).toEqual(44);

    subscription.unsubscribe();
  });

  describe('subscribe()', () => {
    test('dispatching multiple actions within the same event loop only results in one state update', () => {
      const store = createReducerStore(42, {}, (state, _action) => state);

      const observer = {
        next: jest.fn(),
      };

      const subscription = store.subscribe(observer);

      store.next({ type: 'INCREMENT' });
      store.next({ type: 'INCREMENT' });

      expect(observer.next).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
    });

    test('creating multiple subscriptions does not cause actions to be dispatched multiple times', () => {
      const reducer = jest.fn((state, _action) => state);

      const store = createReducerStore(42, {}, reducer, []);

      const observer = {
        next: jest.fn(),
      };

      const subscriptionA = store.subscribe(observer);
      const subscriptionB = store.subscribe(observer);

      store.next({ type: 'INCREMENT' });

      expect(reducer).toHaveBeenCalledTimes(1);

      subscriptionA.unsubscribe();
      subscriptionB.unsubscribe();
    });
  });

  test('multiple stores can share a single dispatcher', () => {
    const action$ = createDispatcher<{ type: 'INCREMENT' }>();

    const storeFactory = createReducerStoreFactory(
      (state: number, action: { type: 'INCREMENT' }) =>
        action.type === 'INCREMENT' ? state + 1 : state,
      [],
      { action$ }
    );

    const store1 = storeFactory(42, {});
    const store2 = storeFactory(24, {});

    const subscription1 = store1.subscribe(() => {});
    const subscription2 = store2.subscribe(() => {});

    action$.next({ type: 'INCREMENT' });

    expect(store1.getValue()).toEqual(43);
    expect(store2.getValue()).toEqual(25);

    subscription1.unsubscribe();
    subscription2.unsubscribe();

    action$.next({ type: 'INCREMENT' });

    expect(store1.getValue()).toEqual(43);
    expect(store2.getValue()).toEqual(25);
  });

  describe('effects', () => {
    test('effects are only active if there is at least one subscription', () => {
      const store = createReducerStore(
        [],
        {},
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
      );

      const subscription = store.subscribe({ next: () => {} });

      store.next({ type: 'PING' });
      expect(store.getValue()).toEqual(['PING', 'PONG']);

      subscription.unsubscribe();

      store.next({ type: 'PING' });
      expect(store.getValue()).toEqual(['PING', 'PONG']);
    });

    test('effects are not duplicated if there are multiple subscriptions', () => {
      const store = createReducerStore(
        [],
        {},
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
      );

      const subscription1 = store.subscribe({ next: () => {} });
      const subscription2 = store.subscribe({ next: () => {} });

      store.next({ type: 'PING' });
      expect(store.getValue()).toEqual(['PING', 'PONG']);

      subscription1.unsubscribe();

      store.next({ type: 'PING' });
      expect(store.getValue()).toEqual(['PING', 'PONG', 'PING', 'PONG']);

      subscription2.unsubscribe();

      store.next({ type: 'PING' });
      expect(store.getValue()).toEqual(['PING', 'PONG', 'PING', 'PONG']);
    });

    describe('"cold" store', () => {
      test('effects are "deactivated" if there are no more subscriptions', () => {
        const actions: Array<Action['type']> = [];

        const store = createReducerStore(
          [],
          {},
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
        );

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

    describe('"hot" store', () => {
      test('effects are not "deactivated" if there are no more subscriptions', () => {
        const actions: Array<Action['type']> = [];

        const store = createReducerStore(
          [],
          {},
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
          ],
          { hot: true }
        );

        store.next({ type: 'PING' });

        expect(actions).toEqual(['PING']);

        const subscription1 = store.subscribe({ next: () => {} });
        const subscription2 = store.subscribe({ next: () => {} });

        store.next({ type: 'PING' });
        expect(actions).toEqual(['PING', 'PING']);

        subscription1.unsubscribe();

        store.next({ type: 'PING' });
        expect(actions).toEqual(['PING', 'PING', 'PING']);

        subscription2.unsubscribe();

        store.next({ type: 'PING' });
        expect(actions).toEqual(['PING', 'PING', 'PING', 'PING']);
      });
    });
  });
});
