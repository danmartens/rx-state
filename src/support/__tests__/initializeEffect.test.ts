import { BehaviorSubject, delay, map } from 'rxjs';
import { ofType } from '../../ofType';
import { Effect } from '../../types';
import { initializeEffect } from '../initializeEffect';

describe('initializeEffect()', () => {
  test('works', async () => {
    const effect: Effect<{ type: 'PING' } | { type: 'PONG' }, number> = (
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
