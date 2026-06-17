import { z } from 'zod'

// --- Inbound DTOs ---

export const EnrichRequestInSchema = z.object({
  contactId: z.string().uuid(),
  templateId: z.string().uuid(),
})
export type EnrichRequestIn = z.infer<typeof EnrichRequestInSchema>

export const BatchEnrichRequestInSchema = z.object({
  contactIds: z.array(z.string().uuid()).min(1),
  templateId: z.string().uuid(),
})
export type BatchEnrichRequestIn = z.infer<typeof BatchEnrichRequestInSchema>

export const RetryEnrichInSchema = z.object({
  insightId: z.string().uuid(),
})
export type RetryEnrichIn = z.infer<typeof RetryEnrichInSchema>

// --- Outbound DTOs ---

const InsightResultSchema = z.object({
  resumen: z.string(),
  recomendaciones: z.array(z.string()),
  observaciones: z.string(),
})

export const InsightOutSchema = z.object({
  id: z.string().uuid(),
  contactId: z.string().uuid(),
  templateId: z.string().uuid(),
  templateVersion: z.number().int(),
  triggerKind: z.enum(['post_import', 'batch', 'individual', 'retry']),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  attempts: z.number().int(),
  result: InsightResultSchema.nullable(),
  modelUsed: z.string().nullable(),
  promptTokens: z.number().int().nullable(),
  completionTokens: z.number().int().nullable(),
  costUsd: z.string().nullable(),
  lastError: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type InsightOut = z.infer<typeof InsightOutSchema>

export const BatchEnrichResponseSchema = z.object({
  insightIds: z.array(z.string().uuid()),
  count: z.number().int(),
})
