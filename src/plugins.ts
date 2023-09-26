import defu from 'defu'
import { oGet } from './utils'
import type { Plugin, Route } from './types'
import type { Voie } from '.'

// The cors plugin is just a simple wrapper for route('OPTIONS'),
// But I write it full-fledge anyway as a plugin boilerplate for copy and code readability
export interface CorsPluginOptions {
  /** @default "['*']" */
  routes?: Route['path'][]
}
export const cors: Plugin<Voie> = (instance, options: CorsPluginOptions) => {
  const pluginData = oGet(instance, '__pluginData__.cors', true)
  const { routes } = defu(options, { routes: ['*'] })

  for (const route of routes)
    instance.route('OPTIONS', route, () => 'cors')
}
