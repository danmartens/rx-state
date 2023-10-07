import { BehaviorSubject, delay, map, tap } from 'rxjs';

import { ofType } from '../../ofType';
import { Effect } from '../../types';
import { initializeEffect } from '../initializeEffect';

describe('initializeEffect()', () => {
  describe('dispatch()', () => {
    test('dispatches an action asynchronously', async () => {
      const effect: Effect<number, { type: 'PING' } | { type: 'PONG' }> = (
        action$
      ) => {
        return action$.pipe(
          ofType('PING'),
          delay(100),
          map(() => ({
            type: 'PONG',
          }))
        );
      };

      const { dispatch, nextAction } = initializeEffect(
        effect,
        new BehaviorSubject(0),
        {}
      );

      dispatch({ type: 'PING' });

      expect(await nextAction()).toEqual({
        type: 'PONG',
      });
    });
  });

  describe('dispatchImmediately()', () => {
    test('dispatches an action synchronously', () => {
      const sideEffect = jest.fn();

      const effect: Effect<number, { type: 'PING' } | { type: 'PONG' }> = (
        action$
      ) => {
        return action$.pipe(
          ofType('PING'),
          tap(() => {
            sideEffect();
          }),
          map(() => ({
            type: 'PONG',
          }))
        );
      };

      const { dispatchImmediately } = initializeEffect(
        effect,
        new BehaviorSubject(0),
        {}
      );

      dispatchImmediately({ type: 'PING' });

      expect(sideEffect).toHaveBeenCalled();
    });

    test('unhandled errors are thrown', async () => {
      const effect: Effect<number, { type: 'PING' } | { type: 'PONG' }> = (
        action$
      ) => {
        return action$.pipe(
          ofType('PING'),
          map(() => {
            throw new Error('Something went wrong');
          })
        );
      };

      const { dispatchImmediately } = initializeEffect(
        effect,
        new BehaviorSubject(0),
        {}
      );

      expect(() => {
        dispatchImmediately({ type: 'PING' });
      }).toThrowError('Something went wrong');
    });
  });
});
