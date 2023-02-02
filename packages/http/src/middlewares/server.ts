import { runHookContext } from "@backhooks/core";
import { configureHeadersHook } from "../hooks/headers";
import { configureBodyHook } from "../hooks/body";
import { setQuery } from "../hooks/query";

export const hooksMiddleware = () => {
  return (req, res, next) => {
    runHookContext(async () => {
      configureHeadersHook(() => {
        return {
          fetch() {
            return req.headers;
          },
        };
      });
      configureBodyHook(() => {
        return {
          fetch() {
            return req.body;
          },
        };
      });
      setQuery(() => {
        return {
          query: req.query,
        };
      });
      next();
    }).catch((error) => {
      next(error);
    });
  };
};
