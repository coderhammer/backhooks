<p align="center"><img width="700" alt="image" src="https://user-images.githubusercontent.com/122128585/213304135-547653ec-1dfd-46f2-909f-520539d3c7b2.png"></p>

# Backhooks

<!-- https://til.simonwillison.net/github-actions/markdown-table-of-contents -->

<!-- toc -->

- [Get started](#get-started)
  - [Install dependency](#install-dependency)
  - [Write your first hook](#write-your-first-hook)
  - [Execute your hook from a context](#execute-your-hook-from-a-context)
- [Usage with HTTP frameworks](#usage-with-http-frameworks)
  - [Usage with ExpressJS](#usage-with-expressjs)
  - [Usage with Fastify](#usage-with-fastify)
- [Writing hooks](#writing-hooks)
- [Global context](#global-context)
- [Applications](#applications)
  - [Logger hook: To log a requestId for each log entry](#logger-hook-to-log-a-requestid-for-each-log-entry)
  - [Authentication hooks: To retrieve the authenticated user during a function execution](#authentication-hooks-to-retrieve-the-authenticated-user-during-a-function-execution)
  - [Validation hooks: To validate body](#validation-hooks-to-validate-body)
- [Contribute](#contribute)

<!-- tocstop -->

Backhooks is a new way to write backend applications by using global hooks scoped to a specific context.

It can be very useful for an HTTP application, for writing reusable and easily testable code.

## Get started

### Install dependency

```
npm install @backhooks/core
```

### Write your first hook

```ts
import { createHook } from "@backhooks/core";

const [useCount, updateCountState] = createHook({
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

### Execute your hook from a context

```ts
import { runHookContext } from "@backhooks/core";

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

## Usage with HTTP frameworks

### Usage with ExpressJS

```
npm install @backhooks/http
```

```ts
import express from "express";
import { useHeaders, hooksMiddleware } from "@backhooks/http";

const app = express();

app.use(hooksMiddleware());

app.get("/", (req, res) => {
  const headers = useHeaders();
  res.send(headers);
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
```

### Usage with Fastify

```
npm install @backhooks/http
```

```ts
import Fastify from "fastify";
import { hooksMiddleware, useHeaders } from "@backhooks/http";

const fastify = Fastify({
  logger: true,
});

fastify.addHook("preHandler", hooksMiddleware());

// Declare a route
fastify.get("/", () => {
  const headers = useHeaders();
  return headers;
});

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
```

## Writing hooks

Writing hooks is very straightforward. Each hook holds a `state` for a particular context.

Let's try out to write a `useAuthorizationHeader` hook:

```ts
import { createHook } from "@backhooks/core";
import { useHeaders } from "@backhooks/http";

const [useAuthorizationHeader, updateAuthorizationHeaderHookState] = createHook(
  {
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
  }
);
```

Now, let's see how we could update our hook state during a context execution:

```ts
import { runHookContext } from "@backhooks/core";

runHookContext(() => {
  updateAuthorizationHeaderHookState((state) => {
    return {
      ...state,
      header: "abc",
    };
  });
  const authorizationHeader = useAuthorizationHeader();
  expect(authorizationHeader).toBe("abc");
});
```

This makes it really easy to test our code. You can even test your hooks by leveraging third party hooks update state function. Let's see how we could test our new hook:

```ts
import { runHookContext } from "@backhooks/core";
import { configureHeadersHook } from "@backhooks/http";
import { useAuthorizationHeader } from "./hooks/useAuthorizationHeader";

test("it should return the authorization header", async () => {
  runHookContext(() => {
    configureHeadersHook((state) => {
      return {
        ...state,
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

## Global context

We have seen that for hooks to work, it should be run in a context.

Note that there also is a global context in your application. So that you **can** but should not really use hooks outside of a context.

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
