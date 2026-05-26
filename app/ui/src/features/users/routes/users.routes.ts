import { createRoute } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { UsersPage } from '../views/users-page'

const usersSearchSchema = z.object({
  search: z.string().optional(),
})

export function createUsersRoutes<TParent extends AnyRoute>(parentRoute: TParent) {
  const usersRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/users',
    validateSearch: usersSearchSchema,
    staticData: { breadcrumb: [{ label: 'Usuarios' }] },
    component: UsersPage,
  })

  return [usersRoute] as const
}
