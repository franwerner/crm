import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginZod } from '@kubb/plugin-zod'

const specBaseUrl = process.env['VITE_API_URL'] ?? 'http://localhost:3000'

export default defineConfig({
  root: '.',
  input: { path: `${specBaseUrl}/openapi.json` },
  output: {
    path: './src/shared/api',
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs({ output: { path: 'types' } }),
    pluginZod({ output: { path: 'schemas' } }),
    pluginClient({ output: { path: 'clients' }, importPath: '@shared/lib/http-client', dataReturnType: 'data' }),
    pluginReactQuery({
      output: { path: 'hooks' },
      client: { importPath: '@shared/lib/http-client', dataReturnType: 'data' },
    }),
  ],
})
