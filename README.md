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

## API

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

### `createReducer()`

TODO: Document this function

### `createEffect()`

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
    state.users.filter((user) => user.isActive)
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
  (users) => users.filter((user) => user.isActive)
);

const ActiveUsers = () => {
  const activeUsers = useSelector(getActiveUsers);

  // ...
};
```

Now, the `ActiveUsers` component will only re-render when the array of users
actually changes.

### Immutability Helpers

#### `set(target, key, value)`

```tsx
set({ value: 42 }, 'value', 84);

// => { value: 84 }
```

#### `setIn(target, ...keys, value)`

```tsx
setIn({ nested: { value: 42 } }, 'nested', 'value', 84);

// => { nested: { value: 84 } }
```

#### `updateIn(target, ...keys, updater)`

```tsx
updateIn({ nested: { value: 42 } }, 'nested', 'value', (value) => value * 2);

// => { nested: { value: 84 } }
```

#### `map(target, callback)`

TODO: Document this function

#### `merge(target, value)`

TODO: Document this function

#### `push(target, value)`

TODO: Document this function

#### `filter(target, predicate)`

TODO: Document this function

#### `mapEntries(target, callback)`

TODO: Document this function

#### `union(target, value)`

TODO: Document this function

#### `splice()`

TODO: Document this function

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
