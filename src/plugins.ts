import defu from 'defu'
import { oGet } from './utils'
import type { Plugin, Route } from './types'
import type { Voie } from '.'

export interface CorsPluginOptions {
  /** @default "['*']" */
  routes?: Route['path'][]
}
export const cors: Plugin<Voie> = (instance, options: CorsPluginOptions) => {
  const pluginData = oGet(instance, '__pluginData__.cors', true)
  const { routes } = defu(options, { routes: ['*'] })

  for (const route of routes)
    instance.route('OPTIONS', route, () => true)
}
