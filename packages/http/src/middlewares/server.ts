import { runHookContext } from "@backhooks/core";
import { configureHeadersHook } from "../hooks/headers";
import { configureBodyHook } from "../hooks/body";

export const hooksMiddleware = () => {
  return (req, res, next) => {
    runHookContext(async () => {
      configureHeadersHook((currentState) => {
        return {
          ...currentState,
          fetch() {
            return req.headers;
          },
        };
      }),
        configureBodyHook((currentState) => {
          return {
            ...currentState,
            fetch() {
              return req.body;
            },
          };
        });
      next();
    }).catch((error) => {
      next(error);
    });
  };
};
