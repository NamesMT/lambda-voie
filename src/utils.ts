// TODO: make a personal utils repo with all the goodies

import { Buffer } from 'node:buffer'
import { brotliCompressSync, brotliDecompressSync, gunzipSync, gzipSync, constants as zlibConstants } from 'node:zlib'
import { defu } from 'defu'
import { destr } from 'destr'
import { objectPick, objectSet } from '@namesmt/utils'
import type { HandlerEvent, HandlerResponse, Route } from './types'

export function fakeEvent(method: Route<any>['method'], path: Route<any>['path'], spread?: Record<string, any>) {
  return {
    rawPath: path,
    requestContext: {
      http: {
        method,
      },
    },
    ...spread,
  } as any as HandlerEvent
}

export function tryIt<F extends (...args: any) => any, D = any>(fn: F, fallbackValue?: D): ReturnType<F> | D | undefined {
  try {
    return fn()
  }
  catch (error) {
    return fallbackValue
  }
}

export class DetailedError extends Error {
  /**
   * Additional message that will be logged AND returned to client
   */
  public detail?: any
  /**
   * Additional code that will be logged AND returned to client
   */
  public code?: any
  /**
   * Additional object that will be logged AND NOT returned to client
   */
  public log?: any
  /**
   * Optionally set the status code to return
   */
  public statusCode?: any

  constructor(message: string, options: { detail?: any, code?: any, statusCode?: number, log?: any } = {}) {
    super(message)
    this.log = options.log
    this.detail = options.detail
    this.code = options.code
    this.statusCode = options.statusCode
  }
}

export function eventMethodUrl(event: HandlerEvent) {
  let method: string, url: string
  if (event.rawPath)
    [method, url] = [event.requestContext.http.method, event.rawPath]
  else if (event.routeKey)
    [method, url] = event.routeKey.split(' ')
  else
    [method, url] = ['', '']

  return { method, url }
}

export function pickEventContext(event: HandlerEvent) {
  return objectPick(
    event,
    [
      'routeKey',
      'rawPath',
      'rawQueryString',
      'headers',
      'requestContext',
      'isBase64Encoded',
    ],
  )
}

/**
 * Compress inputted data, `response` could be passed in to mutate it.
 */
export function compress(data: any, options: { response?: HandlerResponse, acceptEncoding?: string, level?: number } = {}) {
  const {
    acceptEncoding,
    level,
    response,
  } = defu(options, { acceptEncoding: '*', level: 1 })

  const inputData = () => Buffer.isBuffer(data) || typeof data === 'string' ? data : JSON.stringify(data)

  let result: { encoding: string, data: Buffer } | undefined

  if (acceptEncoding.includes('*') || acceptEncoding.includes('br')) {
    result = {
      encoding: 'br',
      data: brotliCompressSync(inputData(), { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: level } }),
    }
  }

  if (acceptEncoding.includes('gzip')) {
    result = {
      encoding: 'gzip',
      data: gzipSync(inputData(), { level }),
    }
  }

  if (result) {
    if (response) {
      objectSet(response, 'headers.Content-Encoding', result.encoding)
      response.body = result.data.toString('base64')
      response.isBase64Encoded = true
    }

    return result
  }

  throw new Error(`Unknown 'accept-encoding': '${acceptEncoding}'`)
}

export function decompress(compressedData: string | Buffer, options: { contentEncoding: string }) {
  const {
    contentEncoding,
  } = options

  if (typeof compressedData === 'string')
    compressedData = Buffer.from(compressedData, 'base64')

  if (contentEncoding === 'br')
    return brotliDecompressSync(compressedData).toString()

  if (contentEncoding === 'gzip')
    return gunzipSync(compressedData).toString()

  throw new Error(`Unknown contentEncoding: '${contentEncoding}'`)
}

export function decodeBody(body: any) {
  return tryIt(() =>
    (typeof body === 'string')
      ? (body[0] === '{')
          ? JSON.parse(body)
          : { string_body: body }
      : (typeof body === 'object' ? body : undefined),
  )
}

/**
 * Helper to decompress and parse the response's body if needed
 */
export function decodeResponse<R extends HandlerResponse>(response: R): R {
  const contentEncoding = response.headers?.['Content-Encoding']

  let responseBody = response.body
  if (contentEncoding)
    responseBody = decompress(response.body, { contentEncoding })

  responseBody = destr(responseBody)

  return {
    ...response,
    body: responseBody,
  }
}
