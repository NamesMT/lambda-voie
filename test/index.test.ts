/* eslint-disable unused-imports/no-unused-vars */
import { describe, expect, test } from 'vitest'
import type { Route } from '~/index'
import { Voie } from '~/index'

function makeTestRouteEvent(method: Route['method'], path: Route['path']) {
  return {
    rawPath: path,
    requestContext: {
      http: {
        method,
      },
    },
  }
}

describe('Voie init', () => {
  let app: Voie

  test('initialize', () => {
    expect(app = new Voie()).toBeTruthy()
  })

  const reInit = () => app = new Voie()

  describe('registering routes', () => {
    describe('normal routes', () => {
      test('GET /health', () => {
        expect(app.route('GET', '/health', () => (
          { statusCode: 200, message: 'Success' }
        ))).toBeTruthy()
      })

      test('GET /before-middleware', () => {
        expect(app.route('GET', '/before-middleware', event => (
          { statusCode: 200, message: 'Success', itWorks: event.itWorks }
        ))).toBeTruthy()

        expect(app.route('GET', '/before-middleware')!.before((event) => { event.itWorks = true })).toBeTruthy()
      })

      test('GET /after-middleware', () => {
        expect(app.route('GET', '/after-middleware', (event, context) => (
          { statusCode: 200, message: 'Success', itWorks: event.itWorks }
        ))).toBeTruthy()

        expect(app.route('GET', '/after-middleware')!.after(() => false)).toBeTruthy()
      })

      test('GET /after-middleware2', () => {
        expect(app.route('GET', '/after-middleware2', () => (
          { statusCode: 200, message: 'Success', itWorks: null }
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
          { statusCode: 200, message: 'Success' },
        )
      })

      test('GET /before-middleware', () => {
        expect(handler(makeTestRouteEvent('GET', '/before-middleware'), {} as any)).resolves.toEqual(
          { statusCode: 200, message: 'Success', itWorks: true },
        )
      })

      test('GET /after-middleware', () => {
        expect(handler(makeTestRouteEvent('GET', '/after-middleware'), {} as any)).resolves.toEqual(false)
      })

      test('GET /after-middleware2', () => {
        expect(handler(makeTestRouteEvent('GET', '/after-middleware2'), {} as any)).resolves.toEqual(
          { statusCode: 200, message: 'Success', itWorks: 'abracadabra' },
        )
      })
    })
  })
})
