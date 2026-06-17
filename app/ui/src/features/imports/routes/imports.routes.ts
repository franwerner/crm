import { createRoute } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { ImportsPage } from '@features/imports/views/imports-page'

export function createImportsRoutes<TParent extends AnyRoute>(parentRoute: TParent) {
  const importsRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/imports',
    staticData: { breadcrumb: [{ label: 'Ingestas' }] },
    component: ImportsPage,
  })

  return [importsRoute] as const
}
