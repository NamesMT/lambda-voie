import { defineBuildConfig } from 'unbuild'
import sharedConfig from './shared.config'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/plugins',
    'src/utils',
    'src/types',
  ],
  declaration: 'node16',
  clean: true,
  rollup: {
    emitCJS: false,
  },
  ...sharedConfig,
})
