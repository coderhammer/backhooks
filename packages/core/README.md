# Backhooks Core

This package holds the core of backhooks.

## Get started

```
npm install @backhooks/core
```

This let's you access to configure backhooks in your application. The following functions are available:

`generateHook: <T, S>(name: string, execute: (store: S) => T) => Promise<T>`

This allows you to create a hook using the `store` of that hook.

Each `store` is initialized to `{}`, an empty record.

Each hook `name` must be unique accross the entire application. By convention, use your package name to define the hook name:

```
generateHook('@backhooks/http/useHeaders', ...)`
```

`configureHook`

Allows you to override the store of a particular hook.

This is how are actually made most of the integrations. Let's look at the implementation of the backhooks middleware for expressJS:

```ts
import { getStorage } from "@backhooks/core";
import { configureHeadersHook, configureBodyHook } from "@backhooks/http";

export const hooksMiddleware = async (req, res, next) => {
  try {
    const storage = await getStorage();
    storage.run(() => {
      configureHeadersHook({
        headers: req.headers,
      });
      next();
    });
  } catch (error) {
    console.error("error while loading storage");
    next(error);
  }
};
```

Internally, to create the `configureHeaderHook` with the correct `headers` values, the package uses `configureHook` to set the correct headers in the store:

```
import { configureHook } from "@backhooks/core";

export const configureHeadersHook = (opt: Partial<HeadersHookOptions>) => {
  return configureHook('@backhooks/http/useHeaders', opt)
}
```

`getStorage`

Allows you to run the hook engine to bind a new storage to each request or call or whatever. Example:

Let's create a unique counter by request:

```ts
const useCount = generateHook("local.useCount", (storage) => {
  if (!storage.count) {
    storage.count = 0;
  }
  storage.count++;
  return storage.count;
});
```

Now, we can use this hook, and a new storage will be created each time you `run` the `Storage` engine:

```ts
import { getStorage } from "@backhooks/core";

const main = async () => {
  const storage = await getStorage();
  storage.run(async () => {
    console.log("count1", await useCount()); // 1
    console.log("count2", await useCount()); // 2
    console.log("count3", await useCount()); // 3
  });
  storage.run(async () => {
    console.log("count1", await useCount()); // 1
    console.log("count2", await useCount()); // 2
    console.log("count3", await useCount()); // 3
  });
};
```
