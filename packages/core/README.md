# Backhooks Core

This package holds the core of backhooks.

## Get started

```
npm install @backhooks/core
```

## Usage

`createHook: (options) => [hookFunction, hookConfigurationFunction]`

This allows you to create a hook. Example of creating a simple hook:

````ts
const [useCount, configureCountHook] = createHook({
  data () {
    return {
      count: 0
    }
  },
  execute (state) {
    state.count++
    return state.count
  }
})

`runHookContext: <T>(fn: () => T): Promise<T>`

This allows you to run a hook context. Any hook called within the `runHookContext` callback will have a specific state attached to it:

```ts
runHookContext(() => {
  console.log(useCount()) // 1
  console.log(useCount()) // 2
  console.log(useCount()) // 3
})

runHookContext(() => {
  console.log(useCount()) // 1
  console.log(useCount()) // 2
  console.log(useCount()) // 3
})
````
