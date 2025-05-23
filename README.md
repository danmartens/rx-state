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
        }),
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
        }),
      ),
    ),
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

## API

### `createDispatcher()`

By default, creating a store also creates an observable for dispatching actions
(via `store.next()`). Sometimes it's useful for the dispatcher (essentially just
an RxJS Subject) to be external so that it can be subscribed to by multiple
stores.

For example, it might be useful to have a global "notifications" store that
other stores can dispatch to (via effects):

```tsx
import { createDispatcher } from '@danmartens/rx-state';

type NotificationsState = { message: string }[];
type PostsState = Record<string, { title: string; body: string }>;

type Action =
  | ShowNotification
  | CreatePostAction
  | CreatePostSuccessAction
  | CreatePostErrorAction;

interface ShowNotificationAction {
  type: 'SHOW_NOTIFICATION';
  message: string;
}

interface CreatePostAction {
  type: 'CREATE_POST';
  title: string;
  body: string;
}

interface CreatePostSuccessAction {
  type: 'CREATE_POST_SUCCESS';
}

interface CreatePostErrorAction {
  type: 'CREATE_POST_ERROR';
}

const action$ = createDispatcher<Action>();

const notificationsStore = createStore<{ message: string }[], Action>(
  (state, action) => {
    // ...

    return state;
  },
  [],
  {
    action$,
  },
);

const postsStore = createStore<State, Action>(
  (state, action) => {
    // ...

    return state;
  },
  [
    (action$) => {
      return action$.pipe(
        ofType('CREATE_POST_SUCCESS' as const, 'CREATE_POST_ERROR' as const),
        map((action) => {
          switch (action.type) {
            case 'CREATE_POST_SUCCESS': {
              return {
                type: 'SHOW_NOTIFICATION',
                message: 'Post created successfully',
              };
            }

            case 'CREATE_POST_ERROR': {
              return {
                type: 'SHOW_NOTIFICATION',
                message: 'Failed to create post',
              };
            }
          }
        }),
      );
    },
  ],
  {
    action$,
  },
)({});
```

Now when a post is created or fails to be created, the `postsStore` will
dispatch a `SHOW_NOTIFICATION` action that the `notificationsStore` will
receive.

_NOTE: When multiple stores share the same dispatcher, all dispatched actions
will be received by all subscribed stores. It's important that you return the
current state at the end of every reducer function unless you are explicitly
handling all actions in each reducer._

### `createEffect()`

TODO: Document this function

### `createReducer()`

TODO: Document this function

### `createSelector()`

Creates a memoized selector function with up to three inputs that are also
memoized. The selector function (always the final argument) is only called when
the inputs change.

This is useful for creating functions that derive values from store state. It's
designed to be used with the `useSelector()` hook that is created via
`createStoreContext()`.

Because the selector function passed to the `useSelector()` hook is called on
every render and it causes the containing component to re-render when its return
value changes, it's important to memoize the selector function if it is deriving
a value from the store state.

A selector function that is only used to extract a subset of the store state
should not be memoized via this function. For example:

```tsx
const Session = () => {
  const currentUser = useSelector((state: State) => state.currentUser);

  // ...
};
```

The selector above does not need to be memoized via `createSelector()`. In fact,
passing it into `createSelector()` will only add unnecessary overhead since the
result of the selector function is already "referentially stable" (i.e. it's not
re-computed on each render).

However, if the selector function is deriving a value from the store state, the
result of the selector function may never be referentially stable if the value
is non-primitive. For example:

```tsx
const ActiveUsers = () => {
  const activeUsers = useSelector((state: State) =>
    state.users.filter((user) => user.isActive),
  );

  // ...
};
```

The selector above will return a new array every time any part of the state
changes. This will cause the `ActiveUsers` component to re-render every time the
state changes, even if the array of users is the same as it was before the state
change.

We can improve this using `createSelector()`:

```tsx
const getActiveUsers = createSelector(
  (state: State) => state.users,
  (users) => users.filter((user) => user.isActive),
);

const ActiveUsers = () => {
  const activeUsers = useSelector(getActiveUsers);

  // ...
};
```

Now, the `ActiveUsers` component will only re-render when the array of users
actually changes.

### `createStore(reducer, effects?, action$?)`

Returns a function that accepts an `initialState` and an optional `dependencies`
object (for effects).

```tsx
createStore<S, A, D>(reducer: (state: S, action: A) => state, effects: Effect<S, A, D>[], action$?: Observable<A>): (initialState: S, dependencies: D) => Store<S, A, D>`
```

#### `reducer: (state: S, action: A) => S`

The reducer function is responsible for updating state whenever an action is
dispatched. Just like with Redux, the state must be immutable and the reducer
function must be pure (repeatedly calling the reducer with the same state and
action inputs should always produce the same output).

#### `effects: Effect<S, A, D>[]`

TODO: Document this argument

#### `action$: Observable<A>`

TODO: Document this argument

### `createStoreContext()`

TODO: Document this function

### `mapActions()`

TODO: Document this function

## Immutability Helpers

### `filter(target, predicate)`

```tsx
filter([1, 2, 3, 4], (n) => n % 2 === 0);

// => [2, 4]
```

### `map(target, callback)`

```tsx
map([1, 2, 3], (n) => n * 2);

// => [2, 4, 6]
```

### `mapEntries(target, callback)`

TODO: Document this function

### `merge(target, value)`

```tsx
merge({ a: 1, b: 2 }, { a: 42 });

// => { a: 42, b: 2 }
```

### `push(target, value)`

```tsx
push([1, 2], 3);

// => [1, 2, 3]
```

### `set(target, key, value)`

```tsx
set({ value: 42 }, 'value', 84);

// => { value: 84 }
```

### `setIn(target, ...keys, value)`

```tsx
setIn({ nested: { value: 42 } }, 'nested', 'value', 84);

// => { nested: { value: 84 } }
```

### `splice()`

TODO: Document this function

### `updateIn(target, ...keys, updater)`

```tsx
updateIn({ nested: { value: 42 } }, 'nested', 'value', (value) => value * 2);

// => { nested: { value: 84 } }
```

### `union(target, value)`

```tsx
union([1, 2, 3], [2, 4]);

// => [1, 2, 3, 4]
```

## Influences

RxState is heavily inspired by my experiences with the following libraries and
it wouldn't be what it is without them.

- [Redux](https://redux.js.org)
- [Redux Observable](https://redux-observable.js.org)
- [Reselect](https://github.com/reduxjs/reselect)
- [Recoil](https://recoiljs.org)
- [Immutable.js](https://immutable-js.com)

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

## Non-goals

- This library is not intended to replace data fetching libraries like SWR,
  React Query, Apollo Client, URQL, etc. It does, however, compliment them quite
  well.
