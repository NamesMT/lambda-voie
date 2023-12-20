import { setTimeout } from 'node:timers/promises'
import { describe, expect, test } from 'vitest'
import type { Plugin } from '~/index'
import { Voie, cors, logger } from '~/index'
import { fakeEvent } from '~/utils'

function _parseBody(res) {
  res.body = JSON.parse(res.body)
  return res
}

describe('Voie init', () => {
  let app: Voie

  test('initialize', () => {
    expect(app = new Voie()).toBeTruthy()
  })

  logger.level = 'warn'

  const reInit = () => app = new Voie()

  test('health check without plugins', () => {
    expect(app.route('GET', '/health', event => app.response(200, { message: 'halo', routeInfo: event.route })))
      .toBeTruthy()

    let handler: ReturnType<Voie['handle']>
    expect(handler = app.handle())
      .toBeTruthy()

    expect(handler(fakeEvent('GET', '/health'), {} as any).then(_parseBody))
      .resolves.toMatchObject(
        { statusCode: 200, body: { message: 'halo', routeInfo: { path: '/health' } } },
      )

    reInit()
  })

  test('health async check without plugins', async () => {
    expect(app.route('GET', '/healthAsync', async (event) => { await setTimeout(50); return app.response(200, { message: 'halo', routeInfo: event.route }) }))
      .toBeTruthy()

    let handler: ReturnType<Voie['handle']>
    expect(handler = app.handle())
      .toBeTruthy()

    await expect(handler(fakeEvent('GET', '/healthAsync'), {} as any).then(_parseBody))
      .resolves.toMatchObject(
        { statusCode: 200, body: { message: 'halo', routeInfo: { path: '/healthAsync' } } },
      )

    reInit()
  })

  describe('registering plugins', () => {
    test('plugin that register GET /pdummy route', () => {
      const _plugin: Plugin<Voie> = (instance, options) => {
        instance.route('GET', '/pdummy', () => app.response(200, 'Success'))
      }

      expect(app.use(_plugin))
        .toEqual(app) // Expect the plugin to execute and return successfully
      expect(app.route('GET', '/pdummy'))
        .toMatchObject({ method: 'GET', path: '/pdummy' }) // Expect the route to be defined
    })

    test('plugin that enables cors', () => {
      expect(app.use(cors))
        .toEqual(app)
    })
  })

  describe('registering routes', () => {
    describe('normal routes', () => {
      test('GET /compressed', () => {
        expect(app.route('GET', '/compressed', event => app.response(200, 'Success', { compress: 1 })))
          .toBeTruthy()
      })

      test('GET /params', () => {
        expect(app.route('GET', '/params', event => (
          { statusCode: 200, body: 'Success', params: event.route.params }
        )))
          .toBeTruthy()
      })

      test('GET /params/:parametric', () => {
        expect(app.route('GET', '/params/:parametric', event => (
          { statusCode: 200, body: 'Success', params: event.route.params }
        )))
          .toBeTruthy()
      })

      test('GET /before-middleware', () => {
        expect(app.route('GET', '/before-middleware', event => (
          { statusCode: 200, body: 'Success', itWorks: event.itWorks }
        )))
          .toBeTruthy()

        expect(app.route('GET', '/before-middleware')!.before((event) => { event.itWorks = true }))
          .toBeTruthy()
      })

      test('GET /after-middleware', () => {
        expect(app.route('GET', '/after-middleware', (event, context) => (
          { statusCode: 200, body: 'Success', itWorks: event.itWorks }
        )))
          .toBeTruthy()

        expect(app.route('GET', '/after-middleware')!.after(() => false))
          .toBeTruthy()
      })

      test('GET /after-middleware2', () => {
        expect(app.route('GET', '/after-middleware2', () => (
          { statusCode: 200, body: 'Success', itWorks: null }
        )))
          .toBeTruthy()

        expect(app.route('GET', '/after-middleware2')!.after((event, context, res) => { res.itWorks = 'abracadabra' }))
          .toBeTruthy()
      })
    })
  })

  describe('executing handlers', () => {
    let handler: ReturnType<Voie['handle']>
    test('make handler', () => {
      expect(handler = app.handle())
        .toBeTruthy()
    })

    test('call handler with empty event', async () => {
      await expect(handler({}, {} as any))
        .rejects.toThrow()
    })

    describe('defaultRoute tests', () => {
      test('normal', () => {
        app.setDefaultRoute((event, context) => ({ event, context }))
        expect(handler(fakeEvent('GET', '/testDR', { headers: { origin: 'test' } }), {} as any))
          .resolves.toEqual(expect.objectContaining({ event: expect.any(Object) }))
      })

      test('passthrough', () => {
        app.setDefaultRoute((event, context) => ({ event, context }), true)
        expect(handler(fakeEvent('GET', '/testDR', { headers: { origin: 'test' } }), { contextTest: 'halo' } as any))
          .resolves.toEqual({
            event: expect.objectContaining({ rawPath: '/testDR', requestContext: { http: { method: 'GET' } } }),
            context: expect.objectContaining({ contextTest: 'halo' }),
          })
      })
    })

    describe('normal routes', () => {
      test('OPTIONS /compressed', () => {
        expect(handler(fakeEvent('OPTIONS', '/compressed', { headers: { origin: 'test' } }), {} as any))
          .resolves.toMatchObject(
            { statusCode: 204, headers: ({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'test' }) },
          )
      })

      test('GET /compressed and cors', () => {
        expect(handler(fakeEvent('GET', '/compressed', { headers: { 'accept-encoding': 'br', 'origin': 'test' } }), {} as any))
          .resolves.toMatchObject(
            { statusCode: 200, isBase64Encoded: true, headers: ({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'test' }) },
          )
      })

      test('GET /params with searchParams', () => {
        expect(handler(fakeEvent('GET', '/params', { rawQueryString: 'hola=333' }), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { hola: '333' } },
          )
      })

      test('GET /params with postBody', () => {
        expect(handler(fakeEvent('GET', '/params', { body: { hola: 444 } }), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { hola: 444 } },
          )
      })

      test('GET /params/:parametric', () => {
        expect(handler(fakeEvent('GET', '/params/working'), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { parametric: 'working' } },
          )
      })

      test('GET /params/:parametric with searchParams and postBody', () => {
        expect(handler(fakeEvent('GET', '/params/working', {
          rawQueryString: 'hola=333&qs',
          body: { pb: true, hola: 444, parametric: 'shouldBeOverridden' },
        }), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { parametric: 'working', hola: '333', qs: '', pb: true } },
          )
      })

      test('GET /before-middleware', () => {
        expect(handler(fakeEvent('GET', '/before-middleware'), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', itWorks: true },
          )
      })

      test('GET /after-middleware', () => {
        expect(handler(fakeEvent('GET', '/after-middleware'), {} as any))
          .resolves.toEqual(false)
      })

      test('GET /after-middleware2', () => {
        expect(handler(fakeEvent('GET', '/after-middleware2'), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', itWorks: 'abracadabra' },
          )
      })
    })
  })
})
