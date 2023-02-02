import { createHook } from "@backhooks/core";

export interface QueryHookState {
  query?: Record<string, string>;
  fetch?: () => Record<string, string>;
}

const [useQuery, setQuery] = createHook({
  data(): QueryHookState {
    return {
      query: undefined as undefined | Record<string, string>,
      fetch: () => {
        return {};
      },
    };
  },
  execute(state) {
    if (state.query) {
      return state.query;
    }
    if (state.fetch) {
      state.query = state.fetch();
    }
    return (state.query || {}) as Record<string, string>;
  },
});

export { useQuery, setQuery };
