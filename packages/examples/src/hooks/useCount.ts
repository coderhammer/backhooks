import { createHook } from "@backhooks/core";

export const useCountKey = "useCount";

const [useCount, configureCountHook] = createHook({
  name: "useCount",
  data() {
    return {
      count: 0,
    };
  },
  execute(state) {
    state.count++;
    return state.count;
  },
});

export { useCount, configureCountHook };
