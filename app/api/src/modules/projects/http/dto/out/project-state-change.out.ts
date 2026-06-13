import { z } from '@hono/zod-openapi'

const ProjectStatusEnum = z.enum(['Draft', 'Active', 'Closed', 'Cancelled'])

export const ProjectStateChangeViewSchema = z
  .object({
    id: z.string().openapi({ description: 'State change UUID' }),
    projectId: z.string().openapi({ description: 'Project UUID' }),
    previousState: ProjectStatusEnum.openapi({ example: 'Draft' }),
    nextState: ProjectStatusEnum.openapi({ example: 'Active' }),
    causeKind: z.enum(['manual', 'system']).openapi({ example: 'manual' }),
    causedByUserId: z.string().nullable().openapi({ description: 'User UUID (manual changes)' }),
    note: z.string().nullable().openapi({ description: 'Optional note for manual changes' }),
    changedAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
    createdAt: z.string().openapi({ description: 'ISO 8601 timestamp' }),
  })
  .openapi('ProjectStateChangeView')

export type ProjectStateChangeView = z.infer<typeof ProjectStateChangeViewSchema>
