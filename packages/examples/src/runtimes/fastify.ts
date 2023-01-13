import Fastify from 'fastify'
import { hooksMiddleware } from '@backhooks/http'
import { mainHandler } from '../handlers'

const fastify = Fastify({
  logger: true
})

fastify.addHook('preHandler', hooksMiddleware())

// Declare a route
fastify.get('/', mainHandler)

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})