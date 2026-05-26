import { z } from '@hono/zod-openapi'

const RoleEnum = z.enum(['Lead', 'Member'])

export const AddResponsibleBodySchema = z
  .object({
    userId: z.string().uuid().openapi({ description: 'UUID of the user being assigned', example: '01938b0c-...' }),
    role: RoleEnum.openapi({ description: 'Responsible role', example: 'Member' }),
  })
  .openapi('AddResponsibleBody')

export type AddResponsibleRequest = z.infer<typeof AddResponsibleBodySchema>

export const UpdateResponsibleRoleBodySchema = z
  .object({
    role: RoleEnum.openapi({ description: 'New responsible role', example: 'Lead' }),
  })
  .openapi('UpdateResponsibleRoleBody')

export type UpdateResponsibleRoleRequest = z.infer<typeof UpdateResponsibleRoleBodySchema>
