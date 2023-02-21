import { createHook } from "@backhooks/core";

type QueryValue = string | undefined | null;
interface ParsedQs {
  [key: string]: ParsedQs | ParsedQs[] | QueryValue | QueryValue[];
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
