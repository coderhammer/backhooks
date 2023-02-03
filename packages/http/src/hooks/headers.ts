import { createHook } from "@backhooks/core";

export interface HeadersHookState {
  headers?: Record<string, string>;
  fetch?: () => Record<string, string>;
}

export const [useHeaders, configureHeadersHook] = createHook({
  data(): HeadersHookState {
    return {
      headers: undefined as undefined | Record<string, string>,
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
    return (state.headers || {}) as Record<string, string>;
  },
});

export const setHeaders = configureHeadersHook;
