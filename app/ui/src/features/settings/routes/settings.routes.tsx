import { createRoute } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { SettingsPage } from '../views/settings-page'
import { TemplatesPage } from '../views/templates-page'

export function createSettingsRoutes<TParent extends AnyRoute>(parentRoute: TParent) {
  // /settings — nav hub with links to sub-sections
  const settingsRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/settings',
    staticData: { breadcrumb: [{ label: 'Configuración' }] },
    component: SettingsPage,
  })

  // /settings/templates — sibling route (no shared Outlet layout needed)
  const templatesRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/settings/templates',
    staticData: {
      breadcrumb: [{ label: 'Configuración', to: '/settings' }, { label: 'Templates de análisis' }],
    },
    component: TemplatesPage,
  })

  return [settingsRoute, templatesRoute] as const
}
