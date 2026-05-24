import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { queryClient, registerUnauthorizedHandler } from '@shared/lib/query-client'
import { getAuthMeQueryOptions } from '@shared/api/hooks/useGetAuthMe'
import { LoginPage } from '@features/auth/routes/login-page'
import { HomePage } from '@app/home-page'

type RouterContext = {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(getAuthMeQueryOptions())
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: HomePage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(getAuthMeQueryOptions())
      throw redirect({ to: '/' })
    } catch (err) {
      if (err instanceof Response || (err as { _isRedirect?: boolean })?._isRedirect) throw err
    }
  },
  component: LoginPage,
})

const routeTree = rootRoute.addChildren([indexRoute, loginRoute])

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

registerUnauthorizedHandler(() => {
  router.navigate({ to: '/login' })
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
