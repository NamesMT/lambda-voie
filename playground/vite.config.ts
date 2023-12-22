import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

import { Voie } from 'lambda-voie'
import { cors } from 'lambda-voie/plugins'

const app = new Voie()
app.use(cors)

export const handler = app.handle()

export default defineConfig({
  plugins: [
    Inspect(),
  ],
})
