import { createHook } from "@backhooks/core";

interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

export interface QueryHookState {
  query?: ParsedQs;
  fetch?: () => ParsedQs;
}

export const [useQuery, setQuery] = createHook({
  data(): QueryHookState {
    return {
      query: undefined,
      fetch() {
        return {};
      },
    };
  },
  execute(state): ParsedQs {
    if (state.query) {
      return state.query;
    }
    if (state.fetch) {
      state.query = state.fetch();
    }
    return state.query || {};
  },
});
