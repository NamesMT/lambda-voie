import { brotliCompressSync, gzipSync, constants as zlibConstants } from 'node:zlib'
import FindMyWay from 'find-my-way'
import { includeKeys } from 'filter-obj'
import type { StatusCodes } from 'readable-http-codes'
import type { Logger } from 'pino'
import type { EventRoute, FMWRoute, LambdaEventRecord, LambdaHandler, LambdaHandlerContext, LambdaHandlerEvent, LambdaHandlerResponse, Route, RouteMiddlewareAfter, RouteMiddlewareBefore, RouterInstance } from './types'
import { oGet, oPathEscape, oSet, stringToSet, tryIt } from './utils'
import { logger } from './logger'

export * from './types'
export * as utils from './utils'
export * from './logger'

// TODO: maybe we should move base Router class to a new minimal not opinionated package?
// TODO: consider patching and ship customized version of find-my-way instead of using too much type overriding.
class Router {
  logger: Logger
  router: RouterInstance

  routes: Record<string, Route> = {}
  eventRoutes: Record<string, Record<string, EventRoute>> = {}

  // while constructor allows passing a defaultRoute, it's recommended to use setDefaultRoute instead to access class methods.
  constructor(options: { logger?: Logger; defaultRoute?: Route['handler'] } = {}) {
    const {
      logger: _logger = logger,
      defaultRoute = () => ({ statusCode: 500, body: 'defaultRoute' }),
    } = options

    this.logger = _logger
    this.router = FindMyWay({
      // @ts-expect-error defaultRoute not compatible
      defaultRoute,
    })
  }

  getDefaultRoute() {
    // @ts-expect-error defaultRoute does not exist
    return this.router.defaultRoute as Route['handler'] | undefined
  }

  setDefaultRoute(handler: Route['handler']): void {
    // @ts-expect-error defaultRoute does not exist
    this.router.defaultRoute = handler
  }

  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name']): EventRoute | undefined
  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name'], handler: EventRoute['handler'], options?: { override?: boolean }): EventRoute
  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name'], handler?: EventRoute['handler'], options: { override?: boolean } = {}) {
    this.logger.trace({ eventSource, name, handler, options }, 'eventRoute()')

    const {
      override = false,
    } = options

    const _route = oGet(this.eventRoutes, `${oPathEscape(eventSource)}.${oPathEscape(name)}`)
    if (!_route) {
      if (!handler) {
        this.logger.debug('No route nor handler')
        return
      }

      return oSet(this.eventRoutes, `${eventSource}.${name}`, {
        handler,
        eventSource,
        name,
        befores: [],
        afters: [],

        before(fn: RouteMiddlewareBefore<LambdaEventRecord>) { this.befores.push(fn); return this },
        after(fn: RouteMiddlewareAfter<LambdaEventRecord>) { this.afters.push(fn); return this },
      })
    }
    else {
      if (!handler)
        return _route

      if (!override)
        throw new Error('Route already exist')

      _route.handler = handler

      return _route
    }
  }

  route(method: Route['method'], path: Route['path']): Route | undefined
  route(method: Route['method'], path: Route['path'], handler: Route['handler'], options?: { override?: boolean }): Route
  route(method: Route['method'], path: Route['path'], handler?: Route['handler'], options: { override?: boolean } = {}) {
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

        before(fn: RouteMiddlewareBefore<LambdaHandlerEvent>) { this.befores.push(fn); return this },
        after(fn: RouteMiddlewareAfter<LambdaHandlerEvent>) { this.afters.push(fn); return this },
      }
    }
    else {
      if (!handler)
        return _route

      if (!override)
        throw new Error('Route already exist')

      _route.handler = handler

      return _route
    }
  }

  async routeHandler(route: Route | EventRoute, data: LambdaHandlerEvent | LambdaEventRecord, context: LambdaHandlerContext) {
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

  _lookupTransform(fn: (lookupData: {
    method: string
    url: string
    event: LambdaHandlerEvent
    context: LambdaHandlerContext
    params: { [k: string]: string | undefined }
    searchParams: { [k: string]: string }
  }) => any): FMWRoute['handler'] {
    return (req, res, params) => {
      const { method, url } = req as { method: string; url: string }
      const { event, context } = res as any as { event: LambdaHandlerEvent; context: LambdaHandlerContext }
      // We will use searchParams data from AWS's event object
      // Because the event.rawPath passed to find-my-way doesn't include searchParams
      // We also doesn't need to disable the internal query parser because it's already optimized if empty:
      // https://github.com/delvedor/find-my-way/blob/ec25619ac06c16f9aabcab54995ce96f91390a62/index.js#L82
      const searchParams = event.queryStringParameters

      return fn({ method, url, event, context, params, searchParams })
    }
  }

  makeOnHandler(route: Route) {
    return this._lookupTransform(({ method, url, event, context, params, searchParams }) => {
      const postBody = tryIt(() =>
        (typeof event.body === 'string')
          ? (event.body[0] === '{')
              ? JSON.parse(event.body)
              : { string_body: event.body }
          : (typeof event.body === 'object' ? event.body : undefined),
      )
      // Based on first visibility overrides: ://api.call/:parametric(params)?searchParams - (POST body)
      const allParams = { ...postBody, ...searchParams, ...params }

      event.route = { method, url, params: allParams }

      return this.routeHandler(route, event, context)
    })
  }

  makeLambdaHandler(): LambdaHandler {
    return async (event: LambdaHandlerEvent, context: LambdaHandlerContext) => {
      try {
        // Simple morphing for event: { cron:true, job:string }
        if (event.cron === true && event.job) {
          event.eventSource = `cron:${event.job}`
          event.Records = [event]
        }

        if (event.Records) {
          for (const Record of event.Records as LambdaEventRecord[]) {
            const eventRoutes = this.eventRoutes[Record.eventSource]

            if (eventRoutes) {
              for (const eventRoute of Object.values(eventRoutes))
                await eventRoute.handler(Record, context)
            }
          }

          return true
        }

        // Using 'as any' to suppress find-my-way req and res type-check errors, it's just sugar typing and doesn't really affect anything
        // Also, correct-cast the return of lookup to Route['handler'] ReturnType
        // Currently Cast to Promise for development purposes
        const result = this.router.lookup({ method: event.requestContext.http.method, url: event.rawPath } as any, { event, context } as any) as ReturnType<Route['handler']>
        return await result
      }
      catch (err) {
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        if (process.env.isLocal)
          throw err

        logger.error(err)
        return { statusCode: 404, body: { message: 'Route not found' } }
      }
    }
  }
}

export class Voie extends Router {
  response(
    statusCode: StatusCodes,
    body: any,
    options: {
      event?: LambdaHandlerEvent

      headers?: Record<string, string>
      cookies?: Record<string, string> | Array<string>
      autoAllow?: boolean
      autoCors?: boolean
      compress?: false | 'auto' | number
      contentType?: string | false
    } = {},
  ): LambdaHandlerResponse {
    this.logger.trace({ statusCode, body, options }, 'response()')

    const {
      event,
      headers = {},
      cookies,
      autoAllow = true,
      autoCors,
      compress,
      contentType = 'application/json',
    } = options

    if (!event && (autoCors || compress))
      throw new Error('event option is required if enabled: autoCors | compress')

    const responseObject: LambdaHandlerResponse = {
      statusCode,
      headers: {
        ...autoAllow
          ? {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Content-Encoding, Access-Control-Request-Method, Access-Control-Request-Headers, *',
              'Access-Control-Allow-Methods': '*',
              'Access-Control-Expose-Headers': '*',
            }
          : undefined,

        ...autoCors
          ? {
              'Access-Control-Allow-Origin': event.headers.origin,
              'Access-Control-Allow-Credentials': true,
            }
          : undefined,

        ...contentType
          ? {
              'Content-Type': 'application/json',
            }
          : undefined,

        ...headers,
      },
      body: JSON.stringify(body),
    }

    if (cookies) {
      if (!Array.isArray(cookies)) {
        const cookiesArr = []
        for (const key in cookies)
          cookiesArr.push(`${key}=${cookies[key]}`)

        responseObject.cookies = cookiesArr
      }
      responseObject.cookies = cookies
    }

    // Note: Each character of JSON.stringify is UTF-16, which is most cases 2 bytes
    // Skips if compress is auto and body is less than 100kB
    if (compress && !(compress === 'auto' && responseObject.body.length < 50000)) {
      const acceptableEncodings = event.headers['accept-encoding'] && stringToSet(event.headers['accept-encoding'])
      if (acceptableEncodings) {
        const compressLevel = compress === 'auto'
          ? responseObject.body.length < 1000000 // ~2MB
            ? 6
            : 1
          : compress

        if (acceptableEncodings.has('br') || acceptableEncodings.has('*')) {
          responseObject.body = brotliCompressSync(responseObject.body, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: compressLevel } })
          responseObject.headers['Content-Encoding'] = 'br'
        }
        else if (acceptableEncodings.has('gzip')) {
          responseObject.body = gzipSync(responseObject.body, { level: compressLevel })
          responseObject.headers['Content-Encoding'] = 'gzip'
        }

        if (responseObject.headers['Content-Encoding']) {
          responseObject.body = responseObject.body.toString('base64')
          responseObject.isBase64Encoded = true
        }
      }
    }

    this.logger.info({
      statusCode,
      info: typeof body === 'object' ? includeKeys(body, ['message', 'notice']) : body,
    })

    return responseObject
  }
}
