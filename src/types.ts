import type { HTTPMethod, HTTPVersion, Handler, RouteOptions } from 'find-my-way'
import type FindMyWay from 'find-my-way'

export type Plugin<Instance, PluginOptions = any> = (instance: Instance, options: PluginOptions) => any

export type RouterInstance = ReturnType<typeof FindMyWay<HTTPVersion.V1>>

export interface EventRoute {
  eventSource: string
  name: string

  handler: (Record: LambdaEventRecord, context: LambdaHandlerContext) => any
  befores: RouteMiddlewareBefore<LambdaEventRecord>[]
  afters: RouteMiddlewareAfter<LambdaEventRecord>[]

  before(fn: RouteMiddlewareBefore<LambdaEventRecord>): this
  after(fn: RouteMiddlewareAfter<LambdaEventRecord>): this
}

export interface Route extends Pick<FMWRoute, 'method' | 'path'> {
  handler: (event: LambdaHandlerEvent, context: LambdaHandlerContext) => LambdaHandlerResponse | any
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
) => Promise<void> | Promise<LambdaHandlerResponse>

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

export type LambdaHandlerEvent = any

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
export type LambdaHandlerResponse = any
