/* eslint-disable unused-imports/no-unused-vars */
import { describe, expect, test } from 'vitest'
import type { Plugin, Route } from '~/index'
import { Voie } from '~/index'

function makeTestRouteEvent(method: Route['method'], path: Route['path'], spread?: Record<string, any>) {
  return {
    rawPath: path,
    requestContext: {
      http: {
        method,
      },
    },
    ...spread,
  }
}

describe('Voie init', () => {
  let app: Voie

  test('initialize', () => {
    expect(app = new Voie()).toBeTruthy()
  })

  const reInit = () => app = new Voie()

  describe('registering plugins', () => {
    test('plugin that register GET /pdummy route', () => {
      const _plugin: Plugin<Voie> = (instance, options) => {
        instance.route('GET', '/pdummy', () => app.response(200, 'Success'))
      }

      expect(app.use(_plugin)).toEqual(app) // Expect the plugin to run and return successfully
      expect(app.route('GET', '/pdummy')).toContain({ method: 'GET', path: '/pdummy' }) // Expect the route to be defined
    })
  })

  describe('registering routes', () => {
    describe('normal routes', () => {
      test('GET /health', () => {
        expect(app.route('GET', '/health', () => (
          { statusCode: 200, body: 'Success' }
        ))).toBeTruthy()
      })

      test('GET /compressed', () => {
        expect(app.route('GET', '/compressed', event => app.response(200, 'Success', { compress: 1, event }))).toBeTruthy()
      })

      test('GET /params', () => {
        expect(app.route('GET', '/params', event => (
          { statusCode: 200, body: 'Success', params: event.route.params }
        ))).toBeTruthy()
      })

      test('GET /params/:parametric', () => {
        expect(app.route('GET', '/params/:parametric', event => (
          { statusCode: 200, body: 'Success', params: event.route.params }
        ))).toBeTruthy()
      })

      test('GET /before-middleware', () => {
        expect(app.route('GET', '/before-middleware', event => (
          { statusCode: 200, body: 'Success', itWorks: event.itWorks }
        ))).toBeTruthy()

        expect(app.route('GET', '/before-middleware')!.before((event) => { event.itWorks = true })).toBeTruthy()
      })

      test('GET /after-middleware', () => {
        expect(app.route('GET', '/after-middleware', (event, context) => (
          { statusCode: 200, body: 'Success', itWorks: event.itWorks }
        ))).toBeTruthy()

        expect(app.route('GET', '/after-middleware')!.after(() => false)).toBeTruthy()
      })

      test('GET /after-middleware2', () => {
        expect(app.route('GET', '/after-middleware2', () => (
          { statusCode: 200, body: 'Success', itWorks: null }
        ))).toBeTruthy()

        expect(app.route('GET', '/after-middleware2')!.after((event, context, res) => { res.itWorks = 'abracadabra' })).toBeTruthy()
      })
    })
  })

  describe('executing handlers', () => {
    let handler: ReturnType<Voie['handle']>
    test('make handler', () => {
      expect(handler = app.handle()).toBeTruthy()
    })

    test('call handler with empty event', async () => {
      await expect(handler({}, {} as any)).rejects.toThrow()
    })

    describe('normal routes', () => {
      test('GET /health', () => {
        expect(handler(makeTestRouteEvent('GET', '/health'), {} as any)).resolves.toEqual(
          { statusCode: 200, body: 'Success' },
        )
      })

      test('GET /compressed', () => {
        expect(handler(makeTestRouteEvent('GET', '/compressed', { headers: { 'accept-encoding': 'br' } }), {} as any)).resolves.toContain(
          { statusCode: 200, isBase64Encoded: true },
        )
      })

      test('GET /params with searchParams', () => {
        expect(handler(makeTestRouteEvent('GET', '/params', { queryStringParameters: { hola: 333 } }), {} as any)).resolves.toEqual(
          { statusCode: 200, body: 'Success', params: { hola: 333 } },
        )
      })

      test('GET /params with postBody', () => {
        expect(handler(makeTestRouteEvent('GET', '/params', { body: { hola: 444 } }), {} as any)).resolves.toEqual(
          { statusCode: 200, body: 'Success', params: { hola: 444 } },
        )
      })

      test('GET /params/:parametric', () => {
        expect(handler(makeTestRouteEvent('GET', '/params/working'), {} as any)).resolves.toEqual(
          { statusCode: 200, body: 'Success', params: { parametric: 'working' } },
        )
      })

      test('GET /params/:parametric with searchParams and postBody', () => {
        expect(handler(makeTestRouteEvent('GET', '/params/working', {
          queryStringParameters: { qs: true, hola: 333 },
          body: { pb: true, hola: 444, parametric: 'shouldBeOverridden' },
        }), {} as any)).resolves.toEqual(
          { statusCode: 200, body: 'Success', params: { parametric: 'working', hola: 333, qs: true, pb: true } },
        )
      })

      test('GET /before-middleware', () => {
        expect(handler(makeTestRouteEvent('GET', '/before-middleware'), {} as any)).resolves.toEqual(
          { statusCode: 200, body: 'Success', itWorks: true },
        )
      })

      test('GET /after-middleware', () => {
        expect(handler(makeTestRouteEvent('GET', '/after-middleware'), {} as any)).resolves.toEqual(false)
      })

      test('GET /after-middleware2', () => {
        expect(handler(makeTestRouteEvent('GET', '/after-middleware2'), {} as any)).resolves.toEqual(
          { statusCode: 200, body: 'Success', itWorks: 'abracadabra' },
        )
      })
    })
  })
})
