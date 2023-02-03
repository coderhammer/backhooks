import { useBody, useHeaders, useParams, useQuery } from "@backhooks/hooks";
import Fastify, { FastifyInstance } from "fastify";
import HooksMiddleware from "../src/index";
import * as request from "supertest";

let app: FastifyInstance;

beforeEach(() => {
  app = Fastify();

  app.addHook("preHandler", HooksMiddleware());
});

test("useBody", async () => {
  app.post("/body", (_, res) => {
    const body = useBody();
    return body;
  });

  const res = await app.inject({
    method: "POST",
    url: "/body",
    payload: {
      foo: "bar",
    },
  });

  const responseBody = res.json();

  expect(responseBody.foo).toBe("bar");
});

test("useParams", async () => {
  app.get("/params/:foo", (_, res) => {
    const params = useParams();
    return params;
  });

  const res = await app.inject({
    method: "GET",
    url: "/params/bar",
  });

  const responseBody = res.json();

  expect(responseBody.foo).toBe("bar");
});

test("useQuery", async () => {
  app.get("/query", (_, res) => {
    const query = useQuery();
    return query;
  });

  const res = await app.inject({
    method: "GET",
    url: "/query?foo=bar",
  });

  const responseBody = res.json();

  expect(responseBody.foo).toBe("bar");
});

test("useHeaders", async () => {
  app.get("/headers", (_, res) => {
    const headers = useHeaders();
    res.send(headers);
  });

  const res = await app.inject({
    method: "GET",
    url: "/headers",
    headers: {
      foo: "bar",
    },
  });

  const responseBody = res.json();

  expect(responseBody.foo).toBe("bar");
});
