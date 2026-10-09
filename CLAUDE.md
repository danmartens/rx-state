# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@danmartens/rx-state` is a small published library: reducer-based React state management that uses RxJS for side effects (Redux/redux-observable style). `react` (18 or 19) and `rxjs` (7) are peer dependencies. Everything public is re-exported from `src/index.ts`, including all of `@danmartens/immutable` (the `setIn`, `filter`, etc. immutability helpers shown in the README live in that external package, not here).

## Commands

Yarn 4 (Berry) via Corepack, Node version from `.nvmrc` (24).

```sh
yarn install
yarn test                          # jest (jsdom, coverage always on)
yarn test src/__tests__/createStore.test.ts   # single file
yarn test -t "name of test"        # single test by name
yarn types:check                   # tsc --noEmit
yarn lint                          # eslint
yarn format:check                  # prettier --check (yarn format to write)
yarn build                         # rollup ESM + CJS into dist/, then tsc emits dist/types
yarn turbo build                   # runs types:check, lint, test, format:check, then build (used by publish)
```

CI (`.github/workflows/check.yml`) runs types:check, test, lint, format:check, and build. A husky pre-commit hook runs lint-staged (prettier + `eslint --fix` on staged `.ts/.tsx`). Publishing to npm happens from a GitHub release.

## Architecture

**Store core (`createStore.ts`).** `createStore(reducer, effects?, options?)` is curried: it returns a `StoreFactory` `(initialState, dependencies) => Store`. A `Store` is an Observable-like object with `next(action)`, `subscribe()`, `getState()`, and `action$`. Internally it holds state in a `BehaviorSubject` and dispatches through a `Dispatcher` (an RxJS `Subject`, from `createDispatcher`).
- Stores are **cold by default**: the reducer subscription and effect subscriptions are only created on the first `subscribe()` and torn down when the subscriber count drops to zero. Actions dispatched while there are no subscribers are not reduced. `options.hot: true` subscribes eagerly and never tears down.
- `options.action$` lets several stores share one dispatcher, so every reducer sees every action (reducers must return the current state for unknown actions).
- `options.logging` enables dev-only action/state-diff logging (`utils/diffObjects` + `utils/formatChangeset`); all logging is gated on `process.env.NODE_ENV !== 'production'`.

**Effects.** `Effect = (action$, state$, dependencies) => Observable<Action>`; every action an effect emits is dispatched back into the store. `dependencies` is the second argument to the store factory (used for injecting API clients etc.). `createEffect(type, fn)` and `createCancelableEffect(type, cancelTypes, fn)` are helpers for promise-returning effects keyed on an action type; `ofType` and `mapActions` are RxJS operators for action filtering/mapping. `support/initializeEffect` is an exported test helper that drives a single effect in isolation (`dispatch`, `dispatchImmediately`, `nextAction`, `nextActionOfType`).

**React bindings.** All hooks are built on `useSyncExternalStore`:
- `useStoreState`, `useStoreDispatch`, `useStore` (`[state, dispatch]`), `useStoreSelector` take a `Store` instance directly.
- `useStoreFactory(factory, initialState, deps)` creates a component-local store once via `useState`.
- `createStoreContext(factory)` returns a `Provider` plus context-bound hooks (`useSelector`, `useDispatch`, `useStore`, `useActionEffect`, `createActionDispatchHook`); the hooks throw if used outside the Provider.
- `createSelector` memoizes derived selector results so `useSelector` doesn't re-render on new-but-equal references.

**Async stores (`createAsyncStore.ts`).** A separate, non-reducer primitive: `createAsyncStore(get, set?)` wraps a getter/setter that may return a value, Promise, or Observable. State is exposed as a `Result<T>` (`result.ts`: `ok`/`error` classes with `isOk`, `isError`, `orThrow`, `valueOf`, `equalTo`). Loading happens on first subscribe and is de-duplicated via a cached promise; `load(true)` forces a reload. Used from React via `useAsyncStore` / `useAsyncStoreState`.

## Conventions

- Type parameter order differs between types: `Store<TState, TAction>` but `Effect<TAction, TState, TDependencies>`.
- `verbatimModuleSyntax` is on: use `import type` / inline `type` for type-only imports. ESLint enforces import ordering (`perfectionist/sort-imports`).
- Tests live in `__tests__/` directories next to the code they cover and run through Babel (not tsc), so type errors only surface via `yarn types:check`.
