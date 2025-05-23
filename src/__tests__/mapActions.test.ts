import { Subject } from 'rxjs';
import { mapActions } from '../mapActions';

interface PingAction {
  type: 'PING';
}

interface PongAction {
  type: 'PONG';
}

type Action = PingAction | PongAction;

describe('mapActions', () => {
  test('maps one action to another', () => {
    const action$ = new Subject<Action>();
    const results: Action[] = [];

    action$
      .pipe(
        mapActions({
          PING: () => ({
            type: 'PONG',
          }),
        }),
      )
      .subscribe((action) => {
        results.push(action);
      });

    action$.next({
      type: 'PING',
    });

    expect(results).toEqual([
      {
        type: 'PONG',
      },
    ]);
  });
});
