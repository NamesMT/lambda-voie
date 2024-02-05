import { defu } from 'defu'
import { objectGet } from '@namesmt/utils'
import type { Plugin, Route } from './types'
import type { Voie } from '.'

// The cors plugin is just a simple wrapper for route('OPTIONS'),
// But I write it full-fledge anyway as a plugin boilerplate for copy and code readability
export interface CorsPluginOptions {
  /** @default "['*']" */
  paths?: Route<any>['path'][]
}
export const cors: Plugin<Voie, CorsPluginOptions> = (instance, options) => {
  const pluginData = objectGet(instance, '__pluginData__.cors', true)
  const { paths } = defu(options, { paths: ['*'] })

  for (const path of paths)
    instance.route('OPTIONS', path, event => instance.response(204, 'cors', { event, autoCors: true }))
}
