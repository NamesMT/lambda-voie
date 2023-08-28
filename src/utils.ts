// TODO: make a personal utils repo with all the goodies

export function tryIt(fn: () => any, fallbackValue?: any) {
  try {
    return fn()
  }
  catch (error) {
    return fallbackValue
  }
}

export function response(statusCode: number, message: string, data?: Record<any, any>) {
  return {
    statusCode,
    message,
    ...data,
  }
}

export function stringToSet(string: string) {
  return new Set(
    string.split(',').map(str => str.trim()),
  )
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
