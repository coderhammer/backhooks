import {
  getHeaders,
  readBody,
  H3Event,
  App,
  getRouterParams,
  getQuery,
} from "h3";
import { setBody, setHeaders, setParams, setQuery } from "@backhooks/hooks";
import { runHookContext } from "@backhooks/core";

export const makeHookableApp = (h3App: App) => {
  const originalHandler = h3App.handler;
  h3App.handler = async (event: H3Event) => {
    return runHookContext(() => {
      const headers = getHeaders(event);
      setHeaders(() => {
        return {
          headers,
        };
      });
      setBody(() => {
        return {
          fetch() {
            return readBody(event);
          },
        };
      });
      setParams(() => {
        return {
          fetch() {
            const params = getRouterParams(event);
            console.log(params);
            return params;
          },
        };
      });
      setQuery(() => {
        return {
          query: getQuery(event),
        };
      });
      return originalHandler(event);
    });
  };
};
