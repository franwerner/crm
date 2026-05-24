import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_PATH: z.string(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Configuración inválida (revisá las variables VITE_ en .env): ${detail}`)
}

export const config = {
  apiBasePath: parsed.data.VITE_API_BASE_PATH,
} as const
