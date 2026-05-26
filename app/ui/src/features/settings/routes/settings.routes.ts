import { createRoute } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { SettingsPage } from '../views/settings-page'

export function createSettingsRoutes<TParent extends AnyRoute>(parentRoute: TParent) {
  const settingsRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/settings',
    staticData: { breadcrumb: [{ label: 'Configuración' }] },
    component: SettingsPage,
  })

  return [settingsRoute] as const
}
