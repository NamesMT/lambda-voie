import FindMyWay from 'find-my-way'
import type { StatusCodes } from 'readable-http-codes'
import type { Logger } from 'pino'
import { defu } from 'defu'
import { isDevelopment } from 'std-env'
import { lambdaRequestTracker } from 'pino-lambda'
import { objectGet, objectSet, toString } from '@namesmt/utils'
import type { Promisable } from 'type-fest'
import type { EventRoute, FMWRoute, HandlerContext, HandlerEvent, HandlerEventRecord, HandlerResponse, LambdaHandler, MiddlewareAfter, MiddlewareBefore, Plugin, Route, RouterConstructOptions, RouterInstance, VoieEventInterfaceAdapter } from './types'
import { DetailedError, decodeBody, compress as doCompress, eventMethodUrl, fakeEvent, tryIt } from './utils'
import { logger } from './logger'

export * from './types'
export * from './utils'
export * from './logger'

// TODO: maybe we should move base Router class to a new minimal not opinionated package?
// TODO: consider patching and ship customized version of find-my-way instead of using too much type overriding.
class Router<EventInterface extends HandlerEvent = HandlerEvent> {
  declare EventInterface: EventInterface
  declare RouteInterface: Route<EventInterface>

  __pluginData__: Record<string, any> = {}
  $event?: EventInterface

  logger: Logger
  withRequest?: ReturnType<typeof lambdaRequestTracker>

  router: RouterInstance

  routes: Record<string, this['RouteInterface']> = {}

  eventRoutes: Record<string, Record<string, EventRoute>> = {}

  allowEmptyRouteLookup = false

  constructor(options: RouterConstructOptions = {}) {
    const resolvedOptions = defu(options, { logger, withRequestOptions: {} })

    this.logger = resolvedOptions.logger
    this.withRequest = resolvedOptions.withRequestOptions && lambdaRequestTracker(resolvedOptions.withRequestOptions)
    this.router = FindMyWay({
      defaultRoute: () => ({ statusCode: 404, body: 'defaultRoute' }),
    })
  }

  use<P extends Plugin<this, any>>(plugin: P, options: Parameters<P>[1] = {}) {
    plugin(this, options)

    return this
  }

  getDefaultRoute() {
    // @ts-expect-error defaultRoute does not exist
    return this.router.defaultRoute as Route['handler'] | undefined
  }

  setDefaultRoute(handler: this['RouteInterface']['handler'], passThrough = false): void {
    // @ts-expect-error defaultRoute does not exist
    this.router.defaultRoute = passThrough ? this.makePassThrough(handler) : this.makeOnHandler({ handler, befores: [], afters: [] })
    this.allowEmptyRouteLookup = passThrough // #1
  }

  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name']): EventRoute | undefined
  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name'], handler: EventRoute['handler'], options?: { override?: boolean }): EventRoute
  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name'], handler?: EventRoute['handler'], options: { override?: boolean } = {}) {
    this.logger.trace({ eventSource, name, handler, options }, 'eventRoute()')

    const {
      override = false,
    } = options

    const _route = objectGet(this.eventRoutes, [eventSource, name])
    if (!_route) {
      if (!handler) {
        this.logger.debug('No route nor handler')
        return
      }

      return objectSet(this.eventRoutes, [eventSource, name], {
        handler,
        eventSource,
        name,
        befores: [],
        afters: [],

        before(fn: MiddlewareBefore<HandlerEventRecord>) { this.befores.push(fn); return this },
        after(fn: MiddlewareAfter<HandlerEventRecord>) { this.afters.push(fn); return this },
      })
    }
    else {
      if (!handler)
        return _route

      if (!override)
        throw new DetailedError('Route already exist', { detail: { eventSource, name } })

      _route.handler = handler

      return _route
    }
  }

  route(method: this['RouteInterface']['method'], path: this['RouteInterface']['path']): this['RouteInterface'] | undefined
  route(method: this['RouteInterface']['method'], path: this['RouteInterface']['path'], handler: this['RouteInterface']['handler'], options?: { override?: boolean }): this['RouteInterface']
  route(method: this['RouteInterface']['method'], path: this['RouteInterface']['path'], handler?: this['RouteInterface']['handler'], options: { override?: boolean } = {}) {
    this.logger.trace({ method, path, handler, options }, 'route()')

    const {
      override = false,
    } = options

    const _route = this.routes[`${method} ${path}`]
    if (!_route) {
      if (!handler) {
        this.logger.debug('No route nor handler')
        return
      }

      return this.routes[`${method} ${path}`] = {
        handler,
        method,
        path,
        befores: [],
        afters: [],

        before(fn: MiddlewareBefore<EventInterface>) { this.befores.push(fn); return this },
        after(fn: MiddlewareAfter<EventInterface>) { this.afters.push(fn); return this },
      }
    }
    else {
      if (!handler)
        return _route

      if (!override)
        throw new DetailedError('Route already exist', { detail: { method, path } })

      _route.handler = handler

      return _route
    }
  }

  routeHandler(route: this['RouteInterface'], data: EventInterface, context: HandlerContext): Promisable<HandlerResponse> | any
  routeHandler(route: EventRoute, data: HandlerEventRecord, context: HandlerContext): Promisable<HandlerResponse> | any
  routeHandler(route: this['RouteInterface'] | EventRoute, data: EventInterface | HandlerEventRecord, context: HandlerContext) {
    return (route.befores.length || route.afters.length)
      ? this._routeHandler(route, data, context)
      : route.handler(data, context)
  }

  async _routeHandler(route: this['RouteInterface'] | EventRoute, data: EventInterface | HandlerEventRecord, context: HandlerContext) {
    for (const middleware of route.befores)
      await middleware(data, context)

    let res = await route.handler(data, context)

    for (const middleware of route.afters)
      res = await middleware(data, context, res) ?? res

    return res
  }

  handle() {
    Object.values(this.routes).forEach((route) => {
      this.router.on(route.method, route.path, this.makeOnHandler(route))
    })

    return this.makeLambdaHandler()
  }

  _lookupShims(event: EventInterface, context: HandlerContext = {} as any) {
    let { method, url } = eventMethodUrl(event)
    if (!method && !this.allowEmptyRouteLookup)
      throw new Error('Empty route lookup')

    // We pass the rawQueryString from Lambda back to url for find-my-way to parse
    // Because Lambda's included event.queryStringParameters prop doesn't parse array keys
    if (event.rawQueryString)
      url = [url, '?', event.rawQueryString].join('')

    // Using 'as any' to suppress find-my-way req and res type-check errors, it's just sugar typing and doesn't really affect anything
    // Also, correct-cast the return of lookup to Route['handler'] ReturnType
    return this.router.lookup({ method, url } as any, { event, context } as any) as ReturnType<this['RouteInterface']['handler']>
  }

  _lookupTransform(fn: (lookupData: {
    method: string
    path: string
    event: EventInterface
    context: HandlerContext
    params: { [k: string]: string | undefined }
    searchParams: { [k: string]: string }
  }) => any): FMWRoute['handler'] {
    return (req, res, params, _store, searchParams) => {
      const { method, url: path } = req as { method: string, url: string }
      const { event, context } = res as any as { event: EventInterface, context: HandlerContext }

      return fn({ method, path, event, context, params, searchParams })
    }
  }

  makePassThrough(handler: this['RouteInterface']['handler']) {
    return this._lookupTransform(({ method, path, event, context, params, searchParams }) => {
      return handler(event, context)
    })
  }

  makeOnHandler(route: this['RouteInterface']) {
    return this._lookupTransform(({ method, path, event, context, params, searchParams }) => {
      // // Constructing params
      const postBody = decodeBody(event.body)
      // Based on first visibility overrides: ://api.call/:parametric(params)?searchParams - (POST body)
      const allParams = { ...postBody, ...searchParams, ...params }
      // //

      // // Constructing cookies
      // From my testings, the v2 payload format is a simple array of "k=v" cookies,
      // without any extra information like expires, secure, httpOnly,... etc.
      // So we don't need a complex parser like "set-cookie-parser"
      let cookies: Record<string, string> | undefined
      if (event.cookies) {
        cookies = {}
        for (const cookie of event.cookies) {
          const splits = cookie.split('=')
          cookies[splits[0]] = splits[1]
        }
      }
      // //

      event.route = { method, path, params: allParams, cookies }

      return this.routeHandler(route, event, context)
    })
  }

  makeLambdaHandler(): LambdaHandler<EventInterface> {
    return async (event: EventInterface, context: HandlerContext) => {
      if (this.withRequest)
        this.withRequest(event, context)

      // // eventRoute processor
      // Simple morphing for event: { eventSource:string }
      if (event.eventSource)
        event.Records = [event]

      if (event.Records) {
        for (const Record of event.Records) {
          const eventRoutes = this.eventRoutes[Record.eventSource]

          if (eventRoutes) {
            if (eventRoutes.$) {
              const eventRoute = eventRoutes.$
              return await this.processRecordHandler(eventRoute.handler, Record, context)
            }
            else {
              const res: Record<EventRoute['name'], any> = {}

              for (const eventRoute of Object.values(eventRoutes)) {
                // Force promise for cleaner catch
                res[eventRoute.name] = await this.processRecordHandler(eventRoute.handler, Record, context)
              }

              return res
            }
          }
        }
      }
      // //

      // // route processor
      // Sets the current processing event to the class global
      this.$event = event

      // Force promise for cleaner catch
      const result = await (async () => this._lookupShims(event, context))().catch((err: any) => {
        if (isDevelopment)
          throw err

        logger.error(err)

        return (err instanceof Error as any) // Cast to any because it could be anything that extends Error
          ? { statusCode: err?.statusCode || 500, body: JSON.stringify({ message: err.message, code: err?.code }) }
          : { statusCode: err?.statusCode || 500, body: JSON.stringify({ message: err }) }
      })

      // Removes event from class global after finish processing
      this.$event = undefined

      return result
      // //
    }
  }

  async processRecordHandler(
    handler: EventRoute['handler'],
    record: HandlerEventRecord,
    context: HandlerContext,
  ) {
    return await (async () => handler(record, context))().catch((err: any) => { // Force promise for cleaner catch
      if (isDevelopment)
        throw err

      logger.error(err)

      return (err instanceof Error as any) // Cast to any because it could be anything that extends Error
        ? { error: true, message: err.message, code: err?.code }
        : { error: true, message: err }
    })
  }
}

export class Voie<EventInterface extends HandlerEvent = HandlerEvent & VoieEventInterfaceAdapter> extends Router {
  declare EventInterface: EventInterface
  declare RouteInterface: Route<EventInterface>

  autoCorsCheck(event: EventInterface) {
    const { method, url } = eventMethodUrl(event)

    return Boolean(
      method // Make sure this a valid URL invoke
      && method !== 'OPTIONS' // Bypass on OPTIONS call
      && this._lookupShims(fakeEvent('OPTIONS', url)).body === 'cors', // Finally, tries the OPTIONS route to see if cors is enabled.
    )
  }

  response(
    statusCode: StatusCodes,
    body: any,
    options: {
      event?: EventInterface

      headers?: Record<string, string>
      cookies?: Record<string, string> | Array<string>
      autoAllow?: boolean
      autoCors?: boolean
      compress?: false | 'auto' | number
      contentType?: string | false
    } = {},
  ): HandlerResponse {
    this.logger.trace({ statusCode, body, options }, 'response()')

    const {
      event = this.$event,
      headers = {},
      cookies,
      autoAllow = true,
      autoCors = event && this.autoCorsCheck(event), // #2
      compress,
      contentType = toString(body).match(/(Object|Array)\]$/) && 'application/json',
    } = options

    if (!event && (autoCors || compress)) {
      throw new Error(
        `event option is required if enabled: ${[autoCors && 'autoCors', compress && 'compress'].filter(v => Boolean(v)).join(', ')}`,
      )
    }

    const responseObject: HandlerResponse & { headers: { [key: string]: any } } = {
      statusCode,
      headers: {
        ...autoAllow
          ? {
              'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Content-Encoding, Access-Control-Request-Method, Access-Control-Request-Headers, *',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Expose-Headers': '*',
            }
          : undefined,

        ...autoCors
          ? {
              'Access-Control-Allow-Origin': event?.headers?.origin ?? event?.headers?.Origin ?? '*',
              'Access-Control-Allow-Credentials': true,
            }
          : undefined,

        ...contentType
          ? {
              'Content-Type': contentType,
            }
          : undefined,

        ...headers,
      },
      body: toString(body).match(/(Object|RegExp|Array|Function)\]$/)
        ? JSON.stringify(body)
        : body,
    }

    if (cookies) {
      if (Array.isArray(cookies)) { responseObject.cookies = cookies }
      else {
        const cookiesArr = []
        for (const key in cookies)
          cookiesArr.push(`${key}=${cookies[key]}`)

        responseObject.cookies = cookiesArr
      }
    }

    // Note: Each character of JSON.stringify is UTF-16, which is most cases 2 bytes
    // Skips if compress is auto and body is less than 100kB
    if (compress && !(compress === 'auto' && responseObject.body.length < 50000)) {
      tryIt(() => {
        doCompress(responseObject.body, {
          response: responseObject,
          acceptEncoding: event?.headers?.['accept-encoding'] ?? '',
          level: compress === 'auto'
            ? responseObject.body.length < 1000000 // ~2MB
              ? 6
              : 1
            : compress,
        })
      })
    }

    if (responseObject.headers['Content-Encoding'] && typeof responseObject.isBase64Encoded === 'undefined')
      responseObject.isBase64Encoded = true

    return responseObject
  }
}
