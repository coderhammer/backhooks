import { createHook } from "@backhooks/core"
import { useHeaders } from "@backhooks/http"

const [useBearerToken, configureBearerTokenHook] = createHook({
  name: 'useBearerToken',
  data () {
    const headers = useHeaders()
    const bearerToken = headers['authorization']?.match(/^Bearer (.*)$/)
    return {
      token: bearerToken?.[1]
    }
  },
  execute (state) {
    return state.token
  }
})

export {
  useBearerToken,
  configureBearerTokenHook
}