import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { queryClient, registerUnauthorizedHandler } from '@shared/lib/config/query-client'
import type { RouterContext } from '@shared/lib/config/query-client'
import type { BreadcrumbItem } from '@shared/lib/breadcrumb'
import { getAuthMeQueryOptions } from '@shared/api/hooks/useGetAuthMe'
import { AppShell } from '@app/shell/app-shell'
import { createContactsRoutes } from '@features/contacts/routes/contacts.routes'
import { createProjectsRoutes } from '@features/projects/routes/projects.routes'
import { createUsersRoutes } from '@features/users/routes/users.routes'
import { createSettingsRoutes } from '@features/settings/routes/settings.routes'
import { createAuthRoutes } from '@features/auth/routes/auth.routes'
import { createImportsRoutes } from '@features/imports/routes/imports.routes'

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
})

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_authenticated',
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(getAuthMeQueryOptions())
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: AppShell,
})

const indexRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/contacts' })
  },
})

const routeTree = rootRoute.addChildren([
  authenticatedRoute.addChildren([
    indexRoute,
    ...createContactsRoutes(authenticatedRoute),
    ...createProjectsRoutes(authenticatedRoute),
    ...createUsersRoutes(authenticatedRoute),
    ...createSettingsRoutes(authenticatedRoute),
    ...createImportsRoutes(authenticatedRoute),
  ]),
  ...createAuthRoutes(rootRoute),
])

export const router = createRouter({
  routeTree,
  context: { queryClient },
})

registerUnauthorizedHandler(() => {
  if (router.state.location.pathname !== '/login') {
    router.navigate({ to: '/login' })
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface StaticDataRouteOption {
    breadcrumb?: BreadcrumbItem[]
  }
}
