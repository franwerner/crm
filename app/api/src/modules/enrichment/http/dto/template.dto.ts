import { z } from 'zod'

// --- Inbound DTOs ---

export const TemplateInSchema = z.object({
  name: z.string().min(1),
  rubro: z.string().min(1),
  prompt: z.string().min(1),
  modelProvider: z.string().min(1),
})
export type TemplateIn = z.infer<typeof TemplateInSchema>

export const TemplateUpdateInSchema = z.object({
  name: z.string().min(1).optional(),
  rubro: z.string().min(1).optional(),
  prompt: z.string().min(1).optional(),
  modelProvider: z.string().min(1).optional(),
})
export type TemplateUpdateIn = z.infer<typeof TemplateUpdateInSchema>

// --- Outbound DTOs ---

export const TemplateOutSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  rubro: z.string(),
  prompt: z.string(),
  modelProvider: z.string(),
  version: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type TemplateOut = z.infer<typeof TemplateOutSchema>
