import type { Context } from 'aws-lambda'
import type { HTTPMethod, HTTPVersion, Handler, RouteOptions } from 'find-my-way'
import FindMyWay from 'find-my-way'
import type { Logger } from 'pino'
import { logger } from './logger'
import { oGet, oPathEscape, oSet, response } from './utils'

interface FMWRoute {
  handler: Handler<HTTPVersion.V2>
  method: HTTPMethod
  path: string
  pattern?: string
  params: string[]
  opts?: RouteOptions
  store?: Record<any, any>
}

type LambdaHandler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: Context,
) => void | Promise<TResult>

type LambdaHandlerEvent = any
type LambdaHandlerContext = Context

interface LambdaEventRecord {
  eventVersion: string
  eventSource: string
  awsRegion: string
  eventTime: string
  eventName: string
  userIdentity: any | {
    principalId: string
  }
  requestParameters: any | {
    sourceIPAddress: string
  }
  responseElements: any
  [key: string]: any
}

/*
  Prototype 1 using class hack and extends in-place 'find-my-way', issue:
  - cannot define new methods in Router (if return a new object from FMW constructor)
  - FMW instance doesn't contains methods (prototype chain) (if using Object.assign)
 */
interface FMWClassHack { new(): ReturnType<typeof FindMyWay> }
const FMW = (function (this: any) {
  const _instance = FindMyWay()
  return _instance
  // return Object.assign(this, Object.create(Object.getPrototypeOf(_instance), Object.getOwnPropertyDescriptors(_instance)))
}) as any as FMWClassHack

class _RouterProto1 extends FMW {
  routesMapped: Record<string, FMWRoute> = {}
  routes: FMWRoute[] = []

  constructor() {
    super()
  }

  route() {
    // eslint-disable-next-line no-console
    return console.log('This method doesn\'t exist on new instances')
  }
}
// end prototype 1
type RouteMiddlewareBefore<D> = (data: D, context: LambdaHandlerContext) => void
type RouteMiddlewareAfter<D> = (data: D, context: LambdaHandlerContext, res: any) => void | any
export interface Route extends Pick<FMWRoute, 'method' | 'path'> {
  handler: (event: LambdaHandlerEvent, context: LambdaHandlerContext) => any
  befores: RouteMiddlewareBefore<LambdaHandlerEvent>[]
  afters: RouteMiddlewareAfter<LambdaHandlerEvent>[]

  before(fn: RouteMiddlewareBefore<LambdaHandlerEvent>): this
  after(fn: RouteMiddlewareAfter<LambdaHandlerEvent>): this
}
export interface EventRoute extends Omit<Route, 'handler' | 'method' | 'path' | 'before' | 'after' | 'befores' | 'afters'> {
  eventSource: string
  name: string

  handler: (Record: LambdaEventRecord, context: LambdaHandlerContext) => any
  befores: RouteMiddlewareBefore<LambdaEventRecord>[]
  afters: RouteMiddlewareAfter<LambdaEventRecord>[]

  before(fn: RouteMiddlewareBefore<LambdaEventRecord>): this
  after(fn: RouteMiddlewareAfter<LambdaEventRecord>): this
}

class Router {
  #logger: Logger
  #router: ReturnType<typeof FindMyWay>

  routes: Record<string, Route> = {}
  eventRoutes: Record<string, Record<string, EventRoute>> = {}

  constructor(options: { logger?: Logger; defaultRoute?: Route['handler'] } = {}) {
    const {
      logger: _logger = logger,
      defaultRoute = () => ({ statusCode: 500, message: 'defaultRoute' }),
    } = options

    this.#logger = _logger
    this.#router = FindMyWay({
      // @ts-expect-error defaultRoute not compatible
      defaultRoute,
    })
  }

  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name']): EventRoute | undefined
  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name'], handler: EventRoute['handler'], options?: { override?: boolean }): EventRoute
  eventRoute(eventSource: EventRoute['eventSource'], name: EventRoute['name'], handler?: EventRoute['handler'], options: { override?: boolean } = {}) {
    this.#logger.trace({ eventSource, name, handler, options }, 'eventRoute()')

    const {
      override = false,
    } = options

    const _route = oGet(this.eventRoutes, `${oPathEscape(eventSource)}.${oPathEscape(name)}`)
    if (!_route) {
      if (!handler) {
        this.#logger.debug('No route nor handler')
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
    this.#logger.trace({ method, path, handler, options }, 'route()')

    const {
      override = false,
    } = options

    const _route = this.routes[`${method} ${path}`]
    if (!_route) {
      if (!handler) {
        this.#logger.debug('No route nor handler')
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

  handle(): LambdaHandler {
    Object.values(this.routes).forEach((route) => {
      this.#router.on(route.method, route.path, this.makeOnHandler(route))
    })
    return this.makeLambdaHandler()
  }

  makeOnHandler(route: Route) {
    return (req: any, res: any, params: { [k: string]: string | undefined }, store: any, searchParams: { [k: string]: string }) => {
      const { method, url } = req as { method: string; url: string }
      const { event, context } = res as { event: LambdaHandlerEvent; context: LambdaHandlerContext }
      const requestParams = { ...searchParams, ...params }

      event.route = { method, url, params: requestParams }

      return this.routeHandler(route, event, context)
    }
  }

  makeLambdaHandler() {
    return async (event: LambdaHandlerEvent, context: Context) => {
      try {
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
        const result = this.#router.lookup({ method: event.requestContext.http.method, url: event.rawPath } as any, { event, context } as any) as ReturnType<Route['handler']>
        return await result
      }
      catch (err) {
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        if (process.env.isLocal)
          throw err

        logger.error(err)
        return response(500, 'Error!', { error: err })
      }
    }
  }
}

// export class Voie extends Router {
//   // routes: Record<string, Route> = {}

//   constructor(options: { logger?: Logger; defaultRoute?: Route['handler'] } = {}) {
//     super(options)
//   }

//   // route(method: Route['method'], path: Route['path']): Route | undefined
//   // route(method: Route['method'], path: Route['path'], handler: Route['handler'], options?: { override?: boolean }): Route
//   // route(method: Route['method'], path: Route['path'], handler?: Route['handler'], options: { override?: boolean } = {}) {
//   //   // @ts-expect-error ts-2345
//   //   return super.route(method, path, handler, options)
//   // }
// }

export class Voie extends Router { }
export { logger }
