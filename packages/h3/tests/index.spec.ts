import { useBody, useHeaders, useParams, useQuery } from "@backhooks/hooks";
import * as supertest from "supertest";
import { SuperTest, Test } from "supertest";
import { App, toNodeListener, createApp, eventHandler, createRouter } from "h3";
import { makeHookableApp } from "../src";

let app: App;
let request: SuperTest<Test>;

beforeEach(() => {
  app = createApp({ debug: true });
  makeHookableApp(app);
  request = supertest(toNodeListener(app));
});

test("useBody", async () => {
  app.use(
    "/body",
    eventHandler(() => {
      const body = useBody();
      return body;
    })
  );

  const res = await request.post("/body").send({
    foo: "bar",
  });

  expect(res.body.foo).toBe("bar");
});

test("useHeaders", async () => {
  app.use(
    "/headers",
    eventHandler(() => {
      const headers = useHeaders();
      return headers;
    })
  );
  const res = await request.get("/headers").send().set({
    foo: "bar",
  });
  expect(res.body.foo).toBe("bar");
});

test("useParams", async () => {
  const router = createRouter();
  router.get(
    "/:foo",
    eventHandler(() => {
      const params = useParams();
      return params;
    })
  );
  app.use(router);
  const res = await request.get("/bar").send();
  expect(res.body.foo).toBe("bar");
});

test("useQuery", async () => {
  app.use(
    "/",
    eventHandler(() => {
      const query = useQuery();
      return query;
    })
  );
  const res = await request.get("/?foo=bar").send();
  expect(res.body.foo).toBe("bar");
});
