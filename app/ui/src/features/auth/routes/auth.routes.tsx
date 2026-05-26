import { createRoute, redirect } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { getAuthMeQueryOptions } from '@shared/api/hooks/useGetAuthMe'
import { LoginPage } from '../views/login-page'

export function createAuthRoutes<TParent extends AnyRoute>(rootParent: TParent) {
  const loginRoute = createRoute({
    getParentRoute: () => rootParent,
    path: '/login',
    beforeLoad: async ({ context }) => {
      try {
        await context.queryClient.ensureQueryData(getAuthMeQueryOptions())
        throw redirect({ to: '/contacts' })
      } catch (err) {
        if (err instanceof Response || (err as { _isRedirect?: boolean })?._isRedirect) throw err
      }
    },
    component: LoginPage,
  })

  return [loginRoute] as const
}
