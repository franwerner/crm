import { z } from '@hono/zod-openapi'

const ProjectStatusEnum = z.enum(['Draft', 'Active', 'Closed', 'Cancelled'])

export const ChangeProjectStateBodySchema = z
  .object({
    newState: ProjectStatusEnum.openapi({ description: 'Target project status', example: 'Active' }),
    note: z
      .string()
      .optional()
      .openapi({ description: 'Optional note explaining the state change', example: 'Client approved the proposal' }),
  })
  .openapi('ChangeProjectStateBody')

export type ChangeProjectStateRequest = z.infer<typeof ChangeProjectStateBodySchema>
