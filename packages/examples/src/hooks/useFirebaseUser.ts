import { initializeApp } from "firebase-admin/app";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { createHook } from "@backhooks/core";
import { useBearerToken } from "./useBearerToken";

const app = initializeApp();
const auth = getAuth(app);

export interface Options {
  user?: null | UserRecord;
  fetchToken?: () => Promise<string | undefined> | string | undefined;
}

const [useUser] = createHook({
  name: "useUser",
  data() {
    return {
      user: undefined as undefined | null | UserRecord,
      token: useBearerToken(),
    };
  },
  async execute(state) {
    if (typeof state.user !== "undefined") {
      return state.user;
    }

    if (!state.token) {
      state.user = null;
      return state.user;
    }

    try {
      const decoded = await auth.verifyIdToken(state.token);
      state.user = await auth.getUser(decoded.uid);
    } catch (error) {
      state.user = null;
    }

    return state.user;
  },
});
