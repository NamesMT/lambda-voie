import { setTimeout } from 'node:timers/promises'
import { describe, expect, it } from 'vitest'
import type { Plugin } from '~/index'
import { Voie, logger } from '~/index'
import { cors } from '~/plugins'
import { decodeResponse, fakeEvent } from '~/utils'

function _parseBody(res: any) {
  res.body = JSON.parse(res.body)
  return res
}

describe('main test', () => {
  let app: Voie

  it('initialize', () => {
    expect(app = new Voie()).toBeTruthy()
  })

  logger.level = 'warn'

  const reInit = () => app = new Voie()

  it('health check without plugins', () => {
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

  it('health async check without plugins', async () => {
    expect(app.route('GET', '/healthAsync', async (event) => {
      await setTimeout(50); return app.response(200, { message: 'halo', routeInfo: event.route })
    }))
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
    it('plugin that register GET /pdummy route', () => {
      const _plugin: Plugin<Voie> = (instance, options) => {
        instance.route('GET', '/pdummy', () => app.response(200, 'Success'))
      }

      expect(app.use(_plugin))
        .toEqual(app) // Expect the plugin to execute and return successfully
      expect(app.route('GET', '/pdummy'))
        .toMatchObject({ method: 'GET', path: '/pdummy' }) // Expect the route to be defined
    })

    it('plugin that enables cors', () => {
      expect(app.use(cors))
        .toEqual(app)
    })
  })

  describe('registering routes', () => {
    describe('normal routes', () => {
      it('do GET /compressed', () => {
        expect(app.route('GET', '/compressed', event => app.response(200, { message: 'Success', luckyNumber: 69 }, { compress: 1 })))
          .toBeTruthy()
      })

      it('do GET /params', () => {
        expect(app.route('GET', '/params', event => (
          { statusCode: 200, body: 'Success', params: event.route.params }
        )))
          .toBeTruthy()
      })

      it('do GET /params/:parametric', () => {
        expect(app.route('GET', '/params/:parametric', event => (
          { statusCode: 200, body: 'Success', params: event.route.params }
        )))
          .toBeTruthy()
      })

      it('do GET /before-middleware', () => {
        expect(app.route('GET', '/before-middleware', event => (
          { statusCode: 200, body: 'Success', itWorks: event.itWorks }
        )))
          .toBeTruthy()

        expect(app.route('GET', '/before-middleware')!.before((event) => { event.itWorks = true }))
          .toBeTruthy()
      })

      it('do GET /after-middleware', () => {
        expect(app.route('GET', '/after-middleware', (event, context) => (
          { statusCode: 200, body: 'Success', itWorks: event.itWorks }
        )))
          .toBeTruthy()

        expect(app.route('GET', '/after-middleware')!.after(() => false))
          .toBeTruthy()
      })

      it('do GET /after-middleware2', () => {
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
    it('make handler', () => {
      expect(handler = app.handle())
        .toBeTruthy()
    })

    it('call handler with empty event', async () => {
      await expect(handler({}, {} as any).then(decodeResponse))
        .resolves.toEqual({ statusCode: 500, body: { message: 'Empty route lookup' } })
    })

    describe('defaultRoute tests', () => {
      it('normal', () => {
        app.setDefaultRoute((event, context) => ({ event, context }))
        expect(handler(fakeEvent('GET', '/testDR', { headers: { origin: 'test' } }), {} as any))
          .resolves.toEqual(expect.objectContaining({ event: expect.any(Object) }))
      })

      it('passthrough', () => {
        app.setDefaultRoute((event, context) => ({ event, context }), true)
        expect(handler(fakeEvent('GET', '/testDR', { headers: { origin: 'test' } }), { contextTest: 'halo' } as any))
          .resolves.toEqual({
            event: expect.objectContaining({ rawPath: '/testDR', requestContext: { http: { method: 'GET' } } }),
            context: expect.objectContaining({ contextTest: 'halo' }),
          })
      })

      it('reset', () => {
        app.setDefaultRoute((event, context) => ({ reset: true }))
        expect(handler(fakeEvent('GET', '/testDR', { headers: { origin: 'test' } }), { contextTest: 'halo' } as any))
          .resolves.toEqual({
            reset: true,
          })
      })
    })

    describe('normal routes', () => {
      it('do OPTIONS /compressed', () => {
        expect(handler(fakeEvent('OPTIONS', '/compressed', { headers: { origin: 'test' } }), {} as any))
          .resolves.toMatchObject(
            { statusCode: 204, headers: ({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'test' }) },
          )
      })

      it('do GET /compressed and cors', () => {
        expect(handler(fakeEvent('GET', '/compressed', { headers: { 'accept-encoding': 'br', 'origin': 'test' } }), {} as any))
          .resolves.toMatchObject(
            { statusCode: 200, isBase64Encoded: true, headers: ({ 'Access-Control-Allow-Credentials': true, 'Access-Control-Allow-Origin': 'test' }) },
          )
      })

      it('do GET /compressed, decodeResponse', () => {
        expect(handler(fakeEvent('GET', '/compressed', { headers: { 'accept-encoding': 'br' } }), {} as any).then(decodeResponse))
          .resolves.toMatchObject(
            { body: { message: 'Success', luckyNumber: 69 } },
          )
      })

      it('do GET /params with searchParams', () => {
        expect(handler(fakeEvent('GET', '/params', { rawQueryString: 'hola=333' }), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { hola: '333' } },
          )
      })

      it('do GET /params with postBody', () => {
        expect(handler(fakeEvent('GET', '/params', { body: { hola: 444 } }), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { hola: 444 } },
          )
      })

      it('do GET /params/:parametric', () => {
        expect(handler(fakeEvent('GET', '/params/working'), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { parametric: 'working' } },
          )
      })

      it('do GET /params/:parametric with searchParams and postBody', () => {
        expect(handler(fakeEvent('GET', '/params/working', {
          rawQueryString: 'hola=333&qs',
          body: { pb: true, hola: 444, parametric: 'shouldBeOverridden' },
        }), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', params: { parametric: 'working', hola: '333', qs: '', pb: true } },
          )
      })

      it('do GET /before-middleware', () => {
        expect(handler(fakeEvent('GET', '/before-middleware'), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', itWorks: true },
          )
      })

      it('do GET /after-middleware', () => {
        expect(handler(fakeEvent('GET', '/after-middleware'), {} as any))
          .resolves.toEqual(false)
      })

      it('do GET /after-middleware2', () => {
        expect(handler(fakeEvent('GET', '/after-middleware2'), {} as any))
          .resolves.toEqual(
            { statusCode: 200, body: 'Success', itWorks: 'abracadabra' },
          )
      })
    })
  })
})
