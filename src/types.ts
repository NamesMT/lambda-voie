import type { HTTPMethod, HTTPVersion, Handler, RouteOptions } from 'find-my-way'
import type FindMyWay from 'find-my-way'
import type { Logger } from 'pino'
import type { LambdaRequestTrackerOptions } from 'pino-lambda'
import type { RequireAllOrNone } from 'type-fest'

export type Plugin<Instance, PluginOptions = any> = (instance: Instance, options: PluginOptions) => any

export type RouterInstance = ReturnType<typeof FindMyWay<HTTPVersion.V1>>

export type EventRouteHandlerResponse = any
export interface EventRoute {
  eventSource: string
  name: string

  handler(record: LambdaEventRecord, context: LambdaHandlerContext): EventRouteHandlerResponse
  befores: RouteMiddlewareBefore<LambdaEventRecord>[]
  afters: RouteMiddlewareAfter<LambdaEventRecord>[]

  before(fn: RouteMiddlewareBefore<LambdaEventRecord>): this
  after(fn: RouteMiddlewareAfter<LambdaEventRecord>): this
}

export type RouteHandlerResponse = LambdaHandlerResponse | any
export interface Route extends Pick<FMWRoute, 'method' | 'path'> {
  handler(event: LambdaHandlerEvent, context: LambdaHandlerContext): RouteHandlerResponse
  befores: RouteMiddlewareBefore<LambdaHandlerEvent>[]
  afters: RouteMiddlewareAfter<LambdaHandlerEvent>[]

  before(fn: RouteMiddlewareBefore<LambdaHandlerEvent>): this
  after(fn: RouteMiddlewareAfter<LambdaHandlerEvent>): this
}

export interface FMWRoute {
  handler: Handler<HTTPVersion.V1>
  method: HTTPMethod
  path: string
  pattern?: string
  params: string[]
  opts?: RouteOptions
  store?: Record<any, any>
}

export type RouteMiddlewareBefore<D> = (data: D, context: LambdaHandlerContext) => void
export type RouteMiddlewareAfter<D> = (data: D, context: LambdaHandlerContext, res: LambdaHandlerResponse) => void | any

export type LambdaHandler = (
  event: LambdaHandlerEvent,
  context: LambdaHandlerContext,
) => Promise<LambdaHandlerResponse>

export interface LambdaEventRecord {
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

export type LambdaHandlerEvent = Record<any, any> & RequireAllOrNone<{
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

export interface VoieRouteAdapter {
  route: {
    method: Route['method']
    path: Route['path']
    params: Record<any, any>
    cookies?: Record<string, string>
  }
}

export interface LambdaHandlerContext {
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

  getRemainingTimeInMillis(): number
}

// TODO: map to @types/aws-lambda.APIGatewayProxyResult (after unbuild#303 is fixed)
export interface LambdaHandlerResponse {
  headers?: { [key: string]: any }
  cookies?: string[]
  statusCode?: number
  body?: any
  isBase64Encoded?: boolean
  [key: string]: any
}

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
