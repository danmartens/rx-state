# RxState

A reducer-based React state management library that uses RxJS for managing
side-effects.

## Creating a Store

```typescript
import { createStore } from '@danmartens/rx-state';

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

const counterStore = createStore((state: number, action: Action) => {
  switch (action.type) {
    case 'DECREMENT':
      return state - 1;

    case 'INCREMENT':
      return state + 1;

    default:
      return state;
  }
})(0);
```

## Using a Store

```typescript
const Counter = () => {
  const [state, dispatch] = useStore(counterStore);

  const decrement = () => {
    dispatch({
      type: 'DECREMENT',
    });
  };

  const increment = () => {
    dispatch({
      type: 'INCREMENT',
    });
  };

  return (
    <div>
      <div>{state}</div>

      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </div>
  );
};
```

## Passing in the Initial State

```typescript
const counterStore = createStore((state: number, action: Action) => {
  switch (action.type) {
    case 'DECREMENT':
      return state - 1;

    case 'INCREMENT':
      return state + 1;

    default:
      return state;
  }
});

const Counter = ({ initialValue }: { initialValue: number }) => {
  const [state, dispatch] = useStoreFactory(counterStore, initialValue);

  /* ... */
};
```

## Simplifying the Reducer

```typescript
import { createReducer } from '@danmartens/rx-state';

type State = number;
type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' };

const reducer = createReducer<State, Action>({
  DECREMENT: (state) => state - 1,
  INCREMENT: (state) => state + 1,
});
```

## Effects

```typescript
import { createReducer, setIn } from '@danmartens/rx-state';

type BlogPost = {
  slug: string;
  title: string;
  content: string;
};

type State = {
  posts: Record<string, BlogPost>;
  postStatuses: Record<string, 'pending' | 'persisted' | 'error'>;
};

type CreatePostAction = { type: 'CREATE_POST'; data: BlogPost };

type CreatePostSuccessAction = {
  type: 'CREATE_POST_SUCCESS';
  data: { slug: string };
};

type CreatePostErrorAction = {
  type: 'CREATE_POST_ERROR';
  data: { slug: string };
};

type Action =
  | CreatePostAction
  | CreatePostSuccessAction
  | CreatePostErrorAction;

const reducer = createReducer<State, Action>({
  CREATE_POST: (state, action) => {
    state = setIn(state, ['posts', action.data.slug], action.data);
    state = setIn(state, ['postStatuses', action.data.slug], 'pending');

    return state;
  },
  CREATE_POST_SUCCESS: (state, action) =>
    setIn(state, ['postStatuses', action.data.slug], 'persisted'),
  CREATE_POST_ERROR: (state, action) =>
    setIn(state, ['postStatuses', action.data.slug], 'error'),
});

const persistPost = (action$) =>
  action$.pipe(
    ofType('CREATE_POST' as const),
    mergeMap((action) =>
      from(
        fetch('/api/posts', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify(action.data),
        })
      ).pipe(
        map(() => ({
          type: 'CREATE_POST_SUCCESS',
          data: { slug: action.data.slug },
        })),
        catchError((error) => {
          console.error(error);

          return of({
            type: 'CREATE_POST_ERROR',
            data: { slug: action.data.slug },
          });
        })
      )
    )
  );

const postsStore = createStore(reducer, [persistPost])({
  posts: {},
  postStatuses: {},
});

postsStore.next({
  type: 'CREATE_POST',
  data: {
    slug: 'hello-world',
    title: 'Hello, world!',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
});
```

## Goals

- State can only be updated by dispatching an action, which is passed to a
  reducer (like Redux)
- State can be global or scoped to a specific piece of UI (like Recoil)
- The initial state can be passed in where the store is being used (i.e. it can
  be derived from props or hooks)
- Side-effects are handled via Observables which receive dispatched actions
  after the state has been updated (like Redux Observable)
- Side-effects can be cancelled by dispatching actions
- Side-effect Observables can have dependencies, which are passed in when the
  store is initialized (and therefore can be derived from props or hooks)
- Redux-like boilerplate is limited as much as possible
