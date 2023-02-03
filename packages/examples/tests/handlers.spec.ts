import { setHeaders } from "@backhooks/hooks";
import { mainHandler } from "../src/handlers";

test("it should return headers", async () => {
  setHeaders((state) => {
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
