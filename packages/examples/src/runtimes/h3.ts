import {
  createApp,
  eventHandler,
  toNodeListener,
  getHeaders,
  readBody,
  H3Event,
  App,
} from "h3";
import { listen } from "listhen";
import { configureBodyHook, configureHeadersHook } from "@backhooks/http";
import { runHookContext } from "@backhooks/core";
import { mainHandler } from "../handlers";

const app = createApp();

const makeHookableApp = (h3App: App) => {
  const originalHandler = h3App.handler;
  h3App.handler = async (event: H3Event) => {
    return runHookContext(() => {
      const headers = getHeaders(event);
      configureHeadersHook(() => {
        return {
          headers,
        };
      });
      configureBodyHook(() => {
        return {
          fetch() {
            return readBody(event);
          },
        };
      });
      return originalHandler(event);
    });
  };
};

makeHookableApp(app);

app.use("/", eventHandler(mainHandler));

listen(toNodeListener(app));
