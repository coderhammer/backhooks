import { createHook } from "@backhooks/core";

const [useBody, configureBodyHook] = createHook({
  data() {
    return {
      body: undefined as any,
      fetch() {
        return undefined as any;
      },
    };
  },
  execute(state) {
    if (typeof state.body !== "undefined") {
      return state.body;
    }
    if (state.fetch) {
      state.body = state.fetch();
    }
    return state.body;
  },
});

export { useBody, configureBodyHook };
