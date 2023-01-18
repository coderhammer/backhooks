import {
  createApp,
  eventHandler,
  toNodeListener,
  getHeaders,
  readBody,
} from "h3";
import { listen } from "listhen";
import {
  configureBodyHook,
  configureHeadersHook,
  useHeaders,
} from "@backhooks/http";
import { runHookContext } from "@backhooks/core";
import { mainHandler } from "../handlers";

const app = createApp();

const hookableEventHandler: typeof eventHandler = (handler) => {
  return eventHandler(async (e) => {
    return runHookContext(async () => {
      configureHeadersHook((state) => {
        return {
          ...state,
          fetch() {
            const headers = getHeaders(e);
            return headers as Record<string, string>;
          },
        };
      });
      configureBodyHook((state) => {
        return {
          ...state,
          fetch() {
            const body = readBody(e);
            return body;
          },
        };
      });
      const response = await handler(e);
      return response;
    }) as ReturnType<typeof handler>;
  });
};

app.use("/", hookableEventHandler(mainHandler));

listen(toNodeListener(app));
