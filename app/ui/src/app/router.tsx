import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'
import type { QueryClient } from '@tanstack/react-query'
import { filterGroupsSchema } from '@shared/lib/filter'
import { queryClient, registerUnauthorizedHandler } from '@shared/lib/query-client'
import { getAuthMeQueryOptions } from '@shared/api/hooks/useGetAuthMe'
import { LoginPage } from '@features/auth/routes/login-page'
import { AppShell } from '@app/shell/app-shell'
import { ContactsPage } from '@features/contacts/routes/contacts-page'
import { UsersPage } from '@features/users/routes/users-page'

const contactsSortDirEnum = z.enum(['asc', 'desc'])
const contactsSortFieldEnum = z.enum(['name', 'phone', 'pipelineState', 'sourceChannel', 'interestLevel', 'createdAt'])

const contactsSearchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  search: z.string().optional(),
  filterGroups: filterGroupsSchema,
  sortField: contactsSortFieldEnum.optional().default('createdAt'),
  sortDir: contactsSortDirEnum.optional().default('desc'),
})

type RouterContext = {
  queryClient: QueryClient
}

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

const contactsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/contacts',
  validateSearch: contactsSearchSchema,
  component: ContactsPage,
})

const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/users',
  component: UsersPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
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

const routeTree = rootRoute.addChildren([
  authenticatedRoute.addChildren([indexRoute, contactsRoute, usersRoute]),
  loginRoute,
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
}
