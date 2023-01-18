import { configureHeadersHook } from "@backhooks/http";
import { mainHandler } from "../src/handlers";

test("it should return headers", async () => {
  configureHeadersHook((state) => {
    return {
      ...state,
      headers: {
        test: "lol",
      },
    };
  });
  const mainResult = await mainHandler();
  expect(mainResult.test).toBe("lol");
});
