import * as express from 'express'
import * as request from 'supertest'
import Fastify from 'fastify'
import { json } from 'body-parser'
import { useBody } from '../src/hooks/body'
import { useHeaders } from '../src/hooks/headers'
import {hooksMiddleware} from '../src/middlewares/server'

test('it should work with express', async () => {
  const app = express()
  app.use(json())
  app.use(hooksMiddleware())
  app.post('/', (req, res) => {
    const headers = useHeaders()
    const body = useBody()
    res.send({
      headers,
      body
    })
  })
  const res = await request(app).post('/').send({
    hello: 'world'
  }).set({
    foo: 'bar'
  })
  expect(res.body.headers.foo).toBe('bar')
  expect(res.body.body.hello).toBe('world')
})

test('it should work with fastify', async () => {
  const fastify = Fastify({
    logger: false
  })

  fastify.addHook('preHandler', hooksMiddleware())

  // Declare a route
  fastify.post('/', () => {
    const headers = useHeaders()
    const body = useBody()
    return {
      headers,
      body
    }
  })

  const res = await fastify.inject({
    method: 'POST',
    url: '/',
    headers: {
      foo: 'bar'
    },
    payload: {
      hello: 'world'
    }
  })

  const responseBody = res.json()

  expect(responseBody.headers.foo).toBe('bar')
  expect(responseBody.body.hello).toBe('world')
})