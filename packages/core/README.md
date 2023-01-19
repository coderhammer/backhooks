# Backhooks Core

This package holds the core of backhooks.

## Get started

```
npm install @backhooks/core
```

## Usage

`createHook: (options) => [hookFunction, hookConfigurationFunction]`

This allows you to create a hook. Example of creating a simple hook:

```ts
const [useCount, configureCountHook] = createHook({
  data() {
    return {
      count: 0,
    };
  },
  execute(state) {
    state.count++;
    return state.count;
  },
});
```

`runHookContext: <T>(fn: () => T): Promise<T>`

This allows you to run a hook context. Any hook called within the `runHookContext` callback will have a specific state attached to it:

```ts
runHookContext(() => {
  console.log(useCount()); // 1
  console.log(useCount()); // 2
  console.log(useCount()); // 3
});

runHookContext(() => {
  console.log(useCount()); // 1
  console.log(useCount()); // 2
  console.log(useCount()); // 3
});
```

`resetGlobalContext()`

This allows you to reset the global context. It can be very useful for testing purposes

```ts
beforeEach(() => {
  resetGlobalContext();
});

test("it should count", async () => {
  const count = useCount();
  expect(count).toBe(1); // true
});

test("it should also count", async () => {
  const count = useCount();
  expect(count).toBe(1); // also true
});
```
