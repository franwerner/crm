import { z } from '@hono/zod-openapi'

// Column-to-field mapping: keys are column header names, values are Contact field names.
export const SetMappingBodySchema = z
  .object({
    mapping: z
      .record(z.string(), z.string())
      .openapi({
        description: 'Maps each Excel column header to a Contact field name.',
        example: { 'Full Name': 'name', 'Email Address': 'email' },
      }),
    templateId: z
      .string()
      .uuid()
      .optional()
      .nullable()
      .openapi({
        description: 'Optional template UUID to associate with this import (no FK in Fase 1).',
        example: '01938b0c-0000-7000-0000-000000000001',
      }),
  })
  .openapi('SetMappingBody')

export type SetMappingRequest = z.infer<typeof SetMappingBodySchema>
