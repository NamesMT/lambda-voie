// TODO: make a personal utils repo with all the goodies

import { Buffer } from 'node:buffer'
import { brotliCompressSync, brotliDecompressSync, gunzipSync, gzipSync, constants as zlibConstants } from 'node:zlib'
import { defu } from 'defu'
import { destr } from 'destr'
import type { LambdaHandlerEvent, LambdaHandlerResponse, Route } from './types'

export function fakeEvent(method: Route['method'], path: Route['path'], spread?: Record<string, any>) {
  return {
    rawPath: path,
    requestContext: {
      http: {
        method,
      },
    },
    ...spread,
  } as any as LambdaHandlerEvent
}

export function tryIt(fn: () => any, fallbackValue?: any) {
  try {
    return fn()
  }
  catch (error) {
    return fallbackValue
  }
}

export const oPathEscape = (str: string) => str.replaceAll('.', '`o\\.')
export const oPathUnescape = (str: string) => str.replaceAll('`o\\.', '.')

export function oPathStringToArray(string: string | string[]): string[] {
  if (!Array.isArray(string))
    string = string.toString().match(/(\\\.|[^.[\]])+/g) || []
  return string.map(oPathUnescape)
}

export function oGet(obj: any, path: string | string[], create?: boolean) {
  if (Object(obj) !== obj)
    return obj

  path = oPathStringToArray(path)

  return path.reduce((prev, curr) => {
    if (create && prev)
      prev[curr] = prev[curr] ?? {}

    return prev && prev[curr]
  }, obj)
}

export function oSet(obj: any, path: string | string[], value: any, create = true) {
  if (Object(obj) !== obj)
    return obj

  path = oPathStringToArray(path)

  const _path = path.splice(-1)[0]

  const _obj = oGet(obj, path, create)

  _obj[_path] = value

  return _obj[_path]
}

/**
 * Compress inputted data, `response` could be passed in to mutate it.
 */
export function compress(data: any, options: { response?: LambdaHandlerResponse; acceptEncoding?: string; level?: number } = {}) {
  const {
    acceptEncoding,
    level,
    response,
  } = defu(options, { acceptEncoding: '*', level: 1 })

  const inputData = () => Buffer.isBuffer(data) || typeof data === 'string' ? data : JSON.stringify(data)

  let result: { encoding: string; data: Buffer } | undefined

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
      response.headers['Content-Encoding'] = result.encoding
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
export function decodeResponse(response: LambdaHandlerResponse) {
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
