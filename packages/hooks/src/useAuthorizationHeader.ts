import { createHook } from "@backhooks/core";
import { useHeaders } from "@backhooks/http";

const [useAuthorizationHeader, configureAuthorizationHeaderHook] = createHook({
  data() {
    const headers = useHeaders();
    return {
      header: headers["authorization"],
    };
  },
  execute(state) {
    return state.header;
  },
});

export { useAuthorizationHeader, configureAuthorizationHeaderHook };
