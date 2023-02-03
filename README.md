<p align="center"><img width="700" alt="image" src="https://user-images.githubusercontent.com/122128585/213304135-547653ec-1dfd-46f2-909f-520539d3c7b2.png"></p>

# Backhooks

<!-- https://til.simonwillison.net/github-actions/markdown-table-of-contents -->

<!-- toc -->

- [Get started](#get-started)
  - [Install dependency](#install-dependency)
  - [ExpressJS usage](#expressjs-usage)
  - [Standalone usage](#standalone-usage)
- [Creating hooks](#creating-hooks)
  - [Using the `createHook` function](#using-the-createhook-function)
  - [Updating hookState at runtime](#updating-hookstate-at-runtime)
- [Other frameworks](#other-frameworks)
  - [Fastify](#fastify)
- [Advanced usage](#advanced-usage)
  - [Global context](#global-context)
  - [Using hooks in hooks](#using-hooks-in-hooks)
  - [Testing hooks](#testing-hooks)
  - [The requestId example](#the-requestid-example)
    - [Use this requestId for logging](#use-this-requestid-for-logging)
- [Dependency Injection framework](#dependency-injection-framework)
- [Applications](#applications)
  - [Logger hook: To log a requestId for each log entry](#logger-hook-to-log-a-requestid-for-each-log-entry)
  - [Authentication hooks: To retrieve the authenticated user during a function execution](#authentication-hooks-to-retrieve-the-authenticated-user-during-a-function-execution)
  - [Validation hooks: To validate body](#validation-hooks-to-validate-body)
- [Contribute](#contribute)

<!-- tocstop -->

Backhook is a type safe, plug and play and funny way of injecting dependencies and manage context through a NodeJS application.

It's compatible with major frameworks like ExpressJS, Fastify, and can also be run standalone in a very simple way.

This project allows you to choose between two packages.

- `@backhooks/core`: For a minimalist dependency injection framework
- `@backhooks/hooks`: For a complete set of builtin hooks that can help you with your daily work. (WIP)

## Get started

### Install dependency

```
npm install @backhooks/hooks
```

### ExpressJS usage

```
npm install @backhooks/express @backhooks/hooks
```

```ts
import express from "express";
import middleware from "@backhooks/express";
import { useHeaders } from "@backhooks/hooks";

const app = express();

app.use(middleware());

app.get("/", (req, res) => {
  const headers = useHeaders(); // <- This is a hook
  res.send(headers);
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
```

### Standalone usage

```ts
import { runHookContext } from "@backhooks/core";
import { useCount } from "./useCount"; // <- We'll see how to build a hook in a minute.

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

## Creating hooks

### Using the `createHook` function

A hook holds a `state` that lives through the entire life of a **hook context**. For the Express application, this context lives through the entire request lifecycle thanks to the express (or other runtime) `middleware`. For a standalone app, this context lives in all the functions called (even deeper function calls) from the `runHookContext` function.

This is made possible thanks to the [`AsyncLocalStorage`](https://nodejs.org/dist/latest-v18.x/docs/api/async_context.html#class-asynclocalstorage) nodeJS API

Backhook's `createHook` function allows you to create a piece of state, that will live through an entire **hook context**.

Let's see how to create a `useCount` hook. This hook will return an incremental value while you call it.

1. Define an initial state function

```ts
import { createHook } from "@backhooks/core";

const [useCount] = createHook({
  // Here, we define a `data` function that will return
  // the initial state of the hook. This function must
  // be synchronous.
  data() {
    return {
      count: 0,
    };
  },
});
```

2. Define the return value of your hook

```ts
import { createHook } from "@backhooks/core";

const [useCount] = createHook({
  data() {
    return {
      count: 0,
    };
  },
  // The `execute` function uses the state, can mutate the state
  // and returns a value. This function can be asynchronous.
  execute(state) {
    state.count++;
    return state.count;
  },
});
```

3. Use the hook in a hook context

```ts
import { createHook, runHookContext } from "@backhooks/core";

const [useCount] = createHook({
  data() {
    return {
      count: 0,
    };
  },
  // The `execute` function uses the state, can mutate the state
  // and returns a value. This function can be asynchronous.
  execute(state) {
    state.count++;
    return state.count;
  },
});

runHookContext(() => {
  console.log(useCount()); // 1
  console.log(useCount()); // 2
  ...
});
```

### Updating hookState at runtime

Hook states can be updated at runtime. If the counter has to start at 50, it can be useful to use the **state updater** returned by the `createHook` function:

```ts
import { createHook, runHookContext } from "@backhooks/core";

const [useCount, setCount] = createHook({
  ...
});

runHookContext(() => {
  setCount(() => {
    return {
      count: 50,
    };
  });
  console.log(useCount()); // 51
});
```

This is exactly how the `middleware` works. It runs a context for the current request, uses the state updater of the `useHeaders` hook and attach the values from the `req` express object.

The `useHeaders()` function can now magically return the values of the request headers through the entire request lifecycle.

## Other frameworks

Don't hesitate to open an issue if you want to use hooks with another framework.

### Fastify

```
npm install @backhooks/fastify @backhooks/hooks
```

```ts
import Fastify from "fastify";
import hooksPreHandler from "@backhooks/fastify";
import { useHeaders } from "@backhooks/hooks";

const fastify = Fastify();

fastify.addHook("preHandler", hooksPreHandler());

// Declare a route
fastify.get("/", () => {
  const headers = useHeaders();
  return headers;
});

// Run the server!
fastify.listen({ port: 3000 }, () => {
  // Server is now listening on ${address}
});
```

## Advanced usage

### Global context

The library allows hooks to live in the global context and to run without the need of a hook context.

You also have the possibility to reset the global state at runtime. This can be very useful to reduce overhead in tests:

```ts
import { resetGlobalContext } from "@backhooks/core";

beforeEach(() => {
  resetGlobalContext();
});

test("it should increment", () => {
  expect(useCount()).toBe(1);
  expect(useCount()).toBe(2);
});

test("it should also increment", () => {
  expect(useCount()).toBe(1);
  expect(useCount()).toBe(2);
});
```

The entire life of the node global process will be bound to a single instance of each called hooks.

### Using hooks in hooks

Defining a hook dependency is very straightforward. As you know, each hook holds a `state` for a specific context.

Let's try out to write a `useAuthorizationHeader` hook:

```ts
import { createHook } from "@backhooks/core";
import { useHeaders } from "@backhooks/hooks";

const [useAuthorizationHeader, updateAuthorizationHeader] = createHook({
  data() {
    // This function is called the first time the hook
    // is used to create the hook state within a specific
    // context

    // Note that in that function, you can use other hooks like `useHeaders`
    const headers = useHeaders();

    // this function MUST be synchronous.
    return {
      header: headers["authorization"],
    };
  },
  execute(state) {
    // This function is called every time the application
    // calls the hook. It must return the value for this hook

    // Note that you can also call other hooks in this function.

    // This function CAN be asynchronous. You will have to await
    // the response of the hook if you make it asynchronous.
    return state.header;
  },
});
```

### Testing hooks

Being able to update the hook state, makes it very easy to unit test our hooks or functions.

```ts
import { runHookContext } from "@backhooks/core";
import { setHeaders } from "@backhooks/hooks";
import { useAuthorizationHeader } from "./hooks/useAuthorizationHeader";

test("it should return the authorization header", () => {
  return runHookContext(() => {
    setHeaders(() => {
      return {
        headers: {
          authorization: "def",
        },
      };
    });
    const authorizationHeader = useAuthorizationHeader();
    expect(authorizationHeader).toBe("def"); // true
  });
});
```

### The requestId example

You can create a `useRequestId` to trace a unique id down the function calls:

```ts
import { createHook } from "@backhooks/core";
import * as crypto from "node:crypto";

export const [useRequestId] = createHook({
  data() {
    return {
      requestId: crypto.randomUUID(),
    };
  },
  execute(state) {
    return state.requestId;
  },
});
```

#### Use this requestId for logging

Create a logger that prepends the `useRequestId()` value in output:

```ts
import { createHook } from "@backhooks/core";
import { useRequestId } from "./useRequestId";

export const [useLogger] = createHook({
  data() {
    return {
      requestId: useRequestId(),
    };
  },
  execute(state) {
    return {
      debug(...args: Parameters<typeof console.debug>) {
        return console.debug(state.requestId, ...args);
      },
    };
  },
});
```

In that way, in all your codebase you can use:

```ts
useLogger().debug("Hello World!");
```

, and all the calls of the same request to that `debug` function will prepend the same requestId.

## Dependency Injection framework

Hooks makes it natural to inject dependencies. You can even use classes if you want:

```ts
import { useLogger } from "./useLogger";

export class MyProvider {
  constructor(private readonly logger = useLogger());

  foo() {
    this.logger.debug("bar!");
  }
}
```

Register a hook for your provider in order to provide dependency injection:

```ts
import { createHook } from "@backhooks/core";
import { MyProvider } from "./MyProvider";

export const [useMyProvider] = createHook({
  data() {
    return new MyProvider();
  },
});
```

And then use your provider where you want in your app:

```ts
app.use("/", (req, res) => {
  const myProvider = useMyProvider();
  myProvider.foo(); // Logs "bar!"
  res.send("ok!");
});
```

## Applications

Hooks can have a variety of applications that are yet to be discovered. Here are some examples:

### Logger hook: To log a requestId for each log entry

```ts
export default function () {
  const logger = useLogger();
  logger.debug("I'm a log entry"); // {"requestId": "abcd", "message": "I'm a log entry"}
}
```

### Authentication hooks: To retrieve the authenticated user during a function execution

```ts
export default function () {
  const user = await useUserOrThrow();
  // Do something with the authenticated user
}
```

### Validation hooks: To validate body

```ts
export default function () {
  const zodSchema = z.object({
    foo: z.string().min(3),
  });

  const parsedBody = useValidatedBody(zodSchema);

  console.log(parsedBody.foo); // Type safe, returns the foo property of the body
}
```

## Contribute

This is really, really early stage. Everything is subject to change. The best way to help me with that is just to communicate me in some way that you are interested in this. You can open an issue or send a message in discussions, or just leave a star on the repo to tell me that I should continue to work on that, I'll be happy to interact!
