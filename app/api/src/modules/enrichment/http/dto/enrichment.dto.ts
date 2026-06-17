import { z } from 'zod'
import { FILTER_OPS, MAX_OR_GROUPS, MAX_CONDITIONS_PER_GROUP } from '@shared/types/filters'

// --- Inbound DTOs ---

export const EnrichRequestInSchema = z.object({
  contactId: z.string().uuid(),
  templateId: z.string().uuid(),
})
export type EnrichRequestIn = z.infer<typeof EnrichRequestInSchema>

// Filter schema for batch-by-filter (mirrors FilterGroup[] from @shared/types/filters).
// Accepts filterGroups as a parsed JSON array instead of query-param wire format,
// because this is a POST body — no need to qs-decode.
const FilterConditionSchema = z.object({
  field: z.string().min(1),
  op: z.enum(FILTER_OPS),
  value: z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))]).optional(),
})

const FilterGroupSchema = z.array(FilterConditionSchema).max(MAX_CONDITIONS_PER_GROUP)

const FilterGroupsSchema = z.array(FilterGroupSchema).max(MAX_OR_GROUPS)

// Discriminated union: existing `ids` shape (kind defaults to 'ids' for backward compat)
// OR new `filter` shape.
export const BatchEnrichByIdsSchema = z.object({
  kind: z.literal('ids').optional().default('ids'),
  contactIds: z.array(z.string().uuid()).min(1),
  templateId: z.string().uuid(),
})

export const BatchEnrichByFilterSchema = z.object({
  kind: z.literal('filter'),
  filterGroups: FilterGroupsSchema,
  search: z.string().min(1).optional(),
  templateId: z.string().uuid(),
})

// Union: route handler validates with the combined schema and discriminates on `kind`.
export const BatchEnrichRequestInSchema = z.discriminatedUnion('kind', [
  BatchEnrichByFilterSchema,
  z.object({
    kind: z.literal('ids'),
    contactIds: z.array(z.string().uuid()).min(1),
    templateId: z.string().uuid(),
  }),
])

export type BatchEnrichRequestIn = z.infer<typeof BatchEnrichRequestInSchema>
export type BatchEnrichByIdsIn = z.infer<typeof BatchEnrichByIdsSchema>
export type BatchEnrichByFilterIn = z.infer<typeof BatchEnrichByFilterSchema>

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
  skipped: z.number().int().optional(),
  exceededMax: z.boolean().optional(),
})

// Query schema for GET /enrichments?contactId={id}
export const InsightListByContactQuerySchema = z.object({
  contactId: z.string().uuid(),
})
export type InsightListByContactQuery = z.infer<typeof InsightListByContactQuerySchema>
