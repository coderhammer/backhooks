import { createHook } from "@backhooks/core";

const useHeadersKey = '@backhooks/http/useHeaders'

export interface HeadersHookOptions {
  headers?: Record<string, string>
  fetch?: () => Record<string, string>
}

const [useHeaders, configureHeadersHook] = createHook({
  name: useHeadersKey,
  data() {
    return {
      headers: undefined as Record<string, string>,
      fetch: () => {
        return {}
      }
    }
  },
  execute(state) {
    if (state.headers) {
      return state.headers
    }
    if (state.fetch) {
      state.headers = state.fetch()
    }
    return (state.headers || {}) as Record<string, string>
  },
})

export {
  useHeaders,
  configureHeadersHook
}