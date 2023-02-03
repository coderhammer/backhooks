import type {
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from "fastify";
import { runHookContext } from "@backhooks/core";
import { setHeaders, setBody, setQuery, setParams } from "@backhooks/hooks";

export default function HooksMiddleware() {
  return (
    req: FastifyRequest,
    res: FastifyReply,
    next: HookHandlerDoneFunction
  ) => {
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
          query: req.query as any,
        };
      });
      setParams(() => {
        return {
          fetch() {
            return req.params as any;
          },
        };
      });
      next();
    }).catch((error) => {
      next(error);
    });
  };
}
