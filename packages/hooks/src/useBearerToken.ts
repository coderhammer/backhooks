import { createHook } from "@backhooks/core";
import { useAuthorizationHeader } from "./useAuthorizationHeader";

export const [useBearerToken, setBearerToken] = createHook({
  data() {
    const authorizationHeader = useAuthorizationHeader();
    if (typeof authorizationHeader !== "string") {
      return undefined;
    }
    const bearerToken = authorizationHeader.match(/^Bearer (.*)$/);
    return bearerToken?.[1];
  },
});
