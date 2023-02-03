import Fastify from "fastify";
import HooksMiddleware from "@backhooks/fastify";
import { mainHandler } from "../handlers";

const fastify = Fastify({
  logger: true,
});

fastify.addHook("preHandler", HooksMiddleware());

// Declare a route
fastify.get("/", mainHandler);

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
