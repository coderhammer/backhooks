import { createHook } from "@backhooks/core";
import { useAuthorizationHeader } from "./useAuthorizationHeader";

const [useBearerToken, configureBearerTokenHook] = createHook({
  data() {
    const authorizationHeader = useAuthorizationHeader();
    const bearerToken = authorizationHeader?.match(/^Bearer (.*)$/);
    return {
      token: bearerToken?.[1],
    };
  },
  execute(state) {
    return state.token;
  },
});

export { useBearerToken, configureBearerTokenHook };
