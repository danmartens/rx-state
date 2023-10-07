---
sidebar_position: 2
---

# Creating a Store

## Basic Stores

```tsx
import { createStore, useStore } from '@danmartens/rx-state';

const counterStore = createStore(0);

const Counter = () => {
  const [value, setValue] = useStore(counterStore);

  const increment = () => {
    setValue(value + 1);
  };

  const decrement = () => {
    setValue(value - 1);
  };

  return (
    <div>
      <div>Count: {value}</div>

      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};
```

## Persisted Stores

Adding persistence to a store is as simple as passing in functions for getting
and setting the persisted value.

```tsx
const counterStore = createStore(0, {
  get: () => {
    const serializedValue = localStorage.getItem('counter');

    if (serializedValue == null) {
      return 0; // Default value
    }

    return JSON.parse(serializedValue);
  },
  set: (value) => {
    localStorage.setItem('counter', JSON.stringify(value));
  },
});
```

## Async Stores

The `get` and `set` functions can also be asynchronous.

```tsx
const counterStore = createStore(0, {
  get: async () => {
    const response = await fetch('/api/counter');

    if (!response.ok()) {
      throw new Error('Invalid API response');
    }

    const { value } = await response.json();

    return value;
  },
  set: async (value) => {
    await fetch('/api/counter', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });
  },
});
```

### Loading State

We can use React's [`<Suspense>`](https://react.dev/reference/react/Suspense)
component to display a loading state while we're waiting on `get` to resolve.

```tsx
import { Suspense } from 'react';

const Counter = () => {
  const [value, setValue] = useStore(counterStore);

  const increment = () => {
    setValue(value + 1);
  };

  const decrement = () => {
    setValue(value - 1);
  };

  return (
    <div>
      <div>Count: {value}</div>

      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};

const AsyncCounter = () => {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <Counter />
    </Suspense>
  );
};
```

### Error Handling

If the `get` function rejects while loading the initial store value, the error
will be thrown by `useStore()`. We can use an
[error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
to display an error instead of breaking our entire app.

```tsx
const AsyncCounter = () => {
  return (
    <ErrorBoundary fallback={<div>Oops! Something went wrong.</div>}>
      <Suspense fallback={<div>Loading…</div>}>
        <Counter />
      </Suspense>
    </ErrorBoundary>
  );
};
```
