import { z } from 'zod'

const EnvSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  API_DOCS_ENABLED: z.enum(['true', 'false']).optional(),
})

const parsed = EnvSchema.safeParse(Bun.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n')
  console.error(`\n❌ Invalid configuration — the API will not start:\n${details}\n`)
  process.exit(1)
}

const env = parsed.data
const isProduction = env.APP_ENV === 'production'

export const config = {
  appEnv: env.APP_ENV,
  isProduction,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  apiDocsEnabled:
    env.API_DOCS_ENABLED === undefined ? !isProduction : env.API_DOCS_ENABLED === 'true',
} as const

export type Config = typeof config
