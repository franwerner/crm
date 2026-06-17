import { z } from 'zod'

const EnvSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  API_DOCS_ENABLED: z.enum(['true', 'false']).optional(),
  // Atributos de la cookie de sesión (auth.md): env vars opcionales con defaults seguros
  SESSION_COOKIE_NAME: z.string().min(1).default('session'),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(604800),
  MINIO_ENDPOINT: z.string().url('MINIO_ENDPOINT must be a valid URL'),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required'),
  MINIO_BUCKET: z.string().min(1, 'MINIO_BUCKET is required'),
  MINIO_REGION: z.string().default('us-east-1'),
  MINIO_USE_SSL: z.enum(['true', 'false']).default('false'),
  // --- ACTIVE in Phase 0 (async infra) ---
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .optional(),
  // --- RESERVED (defined now, consumed in later phases) ---
  // LLM gateway retries — consumed in Phase 1/2 (enrich-llm jobs)
  LLM_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  // --- Fase 1: Ingesta de Contactos por Excel (D3) ---
  IMPORT_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(50),
  IMPORT_DEFAULT_PHONE_REGION: z.string().min(1).default('AR'),
  IMPORT_PROCESSING_STALE_MS: z.coerce.number().int().positive().default(600000),
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
  // Fuente única de verdad para los atributos de la cookie de sesión (auth.md)
  sessionCookieName: env.SESSION_COOKIE_NAME,
  sessionMaxAgeSeconds: env.SESSION_MAX_AGE_SECONDS,
  minioEndpoint: env.MINIO_ENDPOINT,
  minioAccessKey: env.MINIO_ACCESS_KEY,
  minioSecretKey: env.MINIO_SECRET_KEY,
  minioBucket: env.MINIO_BUCKET,
  minioRegion: env.MINIO_REGION,
  minioUseSsl: env.MINIO_USE_SSL === 'true',
  // Async infra (Phase 0+)
  redisUrl: env.REDIS_URL,
  // Default log level: debug in dev/test, info in production
  logLevel: env.LOG_LEVEL ?? (isProduction ? ('info' as const) : ('debug' as const)),
  // Reserved — no consumer yet; typed and available for Phases 1/2
  llmMaxAttempts: env.LLM_MAX_ATTEMPTS,
  // Fase 1: Ingesta de Contactos por Excel (D3)
  importMaxFileSizeMb: env.IMPORT_MAX_FILE_SIZE_MB,
  // Derived: bytes value ready for HTTP-layer size guards
  importMaxFileSizeBytes: env.IMPORT_MAX_FILE_SIZE_MB * 1024 * 1024,
  importDefaultPhoneRegion: env.IMPORT_DEFAULT_PHONE_REGION,
  importProcessingStaleMs: env.IMPORT_PROCESSING_STALE_MS,
} as const

export type Config = typeof config
