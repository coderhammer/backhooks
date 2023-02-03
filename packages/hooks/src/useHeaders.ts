import { createHook } from "@backhooks/core";

export interface HeadersHookState {
  headers?: Record<string, string | string[] | undefined>;
  fetch?: () => Record<string, string | string[] | undefined>;
}

export const [useHeaders, setHeaders] = createHook({
  data(): HeadersHookState {
    return {
      headers: undefined as
        | undefined
        | Record<string, string | string[] | undefined>,
      fetch: () => {
        return {};
      },
    };
  },
  execute(state) {
    if (state.headers) {
      return state.headers;
    }
    if (state.fetch) {
      state.headers = state.fetch();
    }
    return (state.headers || {}) as Record<
      string,
      string | string[] | undefined
    >;
  },
});
