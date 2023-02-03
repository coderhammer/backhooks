import { createHook } from "@backhooks/core";

export interface ParamsHookState {
  params?: Record<string, string>;
  fetch?: () => Record<string, string>;
}

export const [useParams, setParams] = createHook({
  data(): ParamsHookState {
    return {
      params: undefined as undefined | Record<string, string>,
      fetch: () => {
        return {};
      },
    };
  },
  execute(state) {
    if (state.params) {
      return state.params;
    }
    if (state.fetch) {
      state.params = state.fetch();
    }
    return (state.params || {}) as Record<string, string>;
  },
});
