import { createHook } from "@backhooks/core";
import { useHeaders } from "./useHeaders";

export const [useAuthorizationHeader, setAuthorizationHeader] = createHook({
  data(): string | string[] | undefined {
    const headers = useHeaders();
    return headers["authorization"];
  },
});
