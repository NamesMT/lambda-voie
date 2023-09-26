import { defineConfig } from 'vitest/config'
import sharedConfig from './shared.config'

export default defineConfig({
  resolve: {
    alias: sharedConfig.alias,
  },
  ...sharedConfig,
},
)
