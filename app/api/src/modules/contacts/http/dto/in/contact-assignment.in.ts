import { z } from '@hono/zod-openapi'

const RoleEnum = z.enum(['Owner', 'Collaborator'])

export const AddAssignmentBodySchema = z
  .object({
    userId: z.string().uuid().openapi({ description: 'UUID of the user being assigned', example: '01938b0c-...' }),
    role: RoleEnum.openapi({ description: 'Assignment role', example: 'Owner' }),
  })
  .openapi('AddAssignmentBody')

export type AddAssignmentRequest = z.infer<typeof AddAssignmentBodySchema>

export const UpdateAssignmentRoleBodySchema = z
  .object({
    role: RoleEnum.openapi({ description: 'New assignment role', example: 'Collaborator' }),
  })
  .openapi('UpdateAssignmentRoleBody')

export type UpdateAssignmentRoleRequest = z.infer<typeof UpdateAssignmentRoleBodySchema>
