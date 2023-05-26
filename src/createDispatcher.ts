import { Subject } from 'rxjs';

import { Action, Dispatcher } from './types';

export function createDispatcher<
  TAction extends Action
>(): Dispatcher<TAction> {
  return new Subject<TAction>();
}
