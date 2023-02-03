import type { NextFunction, Request, Response } from "express";
import { runHookContext } from "@backhooks/core";
import { setHeaders, setBody, setQuery, setParams } from "@backhooks/hooks";

export default function HooksMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    runHookContext(async () => {
      setHeaders(() => {
        return {
          fetch() {
            return req.headers;
          },
        };
      });
      setBody(() => {
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
      setParams(() => {
        return {
          fetch() {
            return req.params;
          },
        };
      });
      next();
    }).catch((error) => {
      next(error);
    });
  };
}
