import * as Koa from "koa";
import { runHookContext } from "@backhooks/core";
import { useHeaders, configureHeadersHook } from "@backhooks/http";

const app = new Koa();

app.use(async (ctx, next) => {
  await runHookContext(async () => {
    configureHeadersHook((state) => {
      return {
        ...state,
        headers: ctx.request.headers as Record<string, string>,
      };
    });
    await next();
  });
});

app.use(async (ctx, next) => {
  const headers = useHeaders();
  ctx.response.body = headers;
});

app.listen(3000);
