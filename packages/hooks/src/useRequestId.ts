import { createHook } from "@backhooks/core";
import * as crypto from "node:crypto";

const [useRequestId, configureRequestIdHook] = createHook({
  data() {
    return {
      requestId: crypto.randomUUID(),
    };
  },
  execute(state) {
    return state.requestId;
  },
});

export { useRequestId, configureRequestIdHook };
