import { createRoute, Outlet } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { SettingsPage } from '../views/settings-page'
import { TemplatesPage } from '../views/templates-page'

export function createSettingsRoutes<TParent extends AnyRoute>(parentRoute: TParent) {
  // Layout route for /settings — renders SettingsPage which includes internal nav
  const settingsRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/settings',
    staticData: { breadcrumb: [{ label: 'Configuración' }] },
    // Outlet so child routes render inside the settings layout
    component: () => <Outlet />,
  })

  // Index: /settings → SettingsPage (nav hub with links to sub-sections)
  const settingsIndexRoute = createRoute({
    getParentRoute: () => settingsRoute,
    path: '.',
    component: SettingsPage,
  })

  // Sub-section: /settings/templates → TemplatesPage
  const templatesRoute = createRoute({
    getParentRoute: () => settingsRoute,
    path: '/templates',
    staticData: {
      breadcrumb: [{ label: 'Configuración', to: '/settings' }, { label: 'Templates de análisis' }],
    },
    component: TemplatesPage,
  })

  return [settingsRoute.addChildren([settingsIndexRoute, templatesRoute])] as const
}
