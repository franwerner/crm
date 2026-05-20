import { config } from '@shared/config'
import { createApp } from './app'

const app = createApp()

const server = Bun.serve({
  port: config.port,
  fetch: app.fetch,
})

console.log(`🚀 CRM API listening on http://localhost:${server.port} [${config.appEnv}]`)
