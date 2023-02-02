import { createHook } from "@backhooks/core";

interface BodyHookState {
  body?: any;
  fetch?: () => any;
}

const [useBody, configureBodyHook] = createHook({
  data(): BodyHookState {
    return {
      body: undefined,
      fetch() {
        return undefined;
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
