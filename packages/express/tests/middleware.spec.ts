import { useBody, useHeaders, useParams, useQuery } from "@backhooks/hooks";
import * as express from "express";
import HooksMiddleware from "../src/index";
import * as request from "supertest";
import { json } from "body-parser";

let app: ReturnType<typeof express>;

beforeEach(() => {
  app = express();
  app.use(HooksMiddleware());
});

test("useBody", async () => {
  app.use(json());
  app.post("/body", (_, res) => {
    const body = useBody();
    res.send(body);
  });

  const res = await request(app).post("/body").send({
    foo: "bar",
  });

  expect(res.body.foo).toBe("bar");
});

test("useParams", async () => {
  app.get("/params/:foo", (_, res) => {
    const params = useParams();
    res.send(params);
  });
  const res = await request(app).get("/params/bar");
  expect(res.body.foo).toBe("bar");
});

test("useQuery", async () => {
  app.get("/query", (_, res) => {
    const query = useQuery();
    res.send(query);
  });
  const res = await request(app).get("/query?foo=bar");
  expect(res.body.foo).toBe("bar");
});

test("useHeaders", async () => {
  app.get("/headers", (_, res) => {
    const headers = useHeaders();
    res.send(headers);
  });
  const res = await request(app).get("/headers").send().set({
    foo: "bar",
  });
  expect(res.body.foo).toBe("bar");
});
