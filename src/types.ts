import type { HTTPMethod, HTTPVersion, Handler, RouteOptions } from 'find-my-way'
import type FindMyWay from 'find-my-way'
import type { Logger } from 'pino'
import type { LambdaRequestTrackerOptions } from 'pino-lambda'
import type { Promisable, RequireAllOrNone } from 'type-fest'

export type RouterInstance = ReturnType<typeof FindMyWay<HTTPVersion.V1>>

export interface FMWRoute {
  handler: Handler<HTTPVersion.V1>
  method: HTTPMethod
  path: string
  pattern?: string
  params: string[]
  opts?: RouteOptions
  store?: Record<any, any>
}

export type Plugin<Instance, PluginOptions = any> = (instance: Instance, options: PluginOptions) => any

export type HandlerEvent =
  Record<any, any>
  & RequireAllOrNone<{
    version: string
    routeKey: string
    rawPath: string
    rawQueryString: string
    headers: {
      [key: string]: string
      'accept-encoding': string
      'host': string
      'user-agent': string
      'via': string
      'x-amz-cf-id': string
      'x-amzn-trace-id': string
      'x-forwarded-for': string
      'x-forwarded-port': string
      'x-forwarded-proto': string
    }
    requestContext: {
      accountId: string
      apiId: string
      domainName: string
      domainPrefix: string
      http: {
        method: string
        path: string
        protocol: string
        sourceIp: string
        userAgent: string
      }
      requestId: string
      routeKey: string
      stage: string
      time: string
      timeEpoch: number
    }
    isBase64Encoded: boolean
  }>
  & RequireAllOrNone<{
    Records: HandlerEventRecord[]
  }>

export type HandlerEventRecord = Record<any, any> & RequireAllOrNone<{
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
}>

export interface HandlerContext {
  callbackWaitsForEmptyEventLoop: boolean
  functionName: string
  functionVersion: string
  invokedFunctionArn: string
  memoryLimitInMB: string
  awsRequestId: string
  logGroupName: string
  logStreamName: string
  identity?: any | undefined
  clientContext?: any | undefined

  getRemainingTimeInMillis: () => number
}

export interface HandlerResponse {
  headers?: { [key: string]: any }
  cookies?: string[]
  statusCode?: number
  body?: any
  isBase64Encoded?: boolean
  [key: string]: any
}

export interface VoieEventInterfaceAdapter {
  route: {
    method: Route<any>['method']
    path: Route<any>['path']
    params: Record<any, any>
    cookies?: Record<string, string>
  }
}

export interface EventRoute {
  eventSource: string
  name: string

  handler: (record: HandlerEventRecord, context: HandlerContext) => any
  befores: MiddlewareBefore<HandlerEventRecord>[]
  afters: MiddlewareAfter<HandlerEventRecord>[]

  before: (fn: MiddlewareBefore<HandlerEventRecord>) => this
  after: (fn: MiddlewareAfter<HandlerEventRecord>) => this
}

export interface Route<EventInterface extends HandlerEvent> extends Pick<FMWRoute, 'method' | 'path'> {
  handler: LambdaHandler<EventInterface>
  befores: MiddlewareBefore<EventInterface>[]
  afters: MiddlewareAfter<EventInterface>[]

  before: (fn: MiddlewareBefore<EventInterface>) => this
  after: (fn: MiddlewareAfter<EventInterface>) => this
}

export type MiddlewareBefore<D> = (data: D, context: HandlerContext) => Promisable<void>
export type MiddlewareAfter<D> = (data: D, context: HandlerContext, res: HandlerResponse) => Promisable<any>

export type LambdaHandler<EventInterface extends HandlerEvent> = (
  event: EventInterface,
  context: HandlerContext,
) => Promisable<HandlerResponse> | any

export interface RouterConstructOptions {
  /**
   * Pass in your custom logger if needed.
   */
  logger?: Logger

  /**
   * Options for `pino-lambda`'s withRequest(), could be disabled with falsy values.
   */
  withRequestOptions?: LambdaRequestTrackerOptions
}
