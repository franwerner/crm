import { Link, useMatches } from '@tanstack/react-router'
import type { RegisteredRouter } from '@tanstack/react-router'
import type { RoutePaths } from '@tanstack/router-core'
import { Home } from 'lucide-react'

export function Breadcrumbs() {
  const matches = useMatches()
  const activeMatch = [...matches].reverse().find((m) => m.staticData.breadcrumb)
  const trail = activeMatch?.staticData.breadcrumb ?? []

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <Link to="/" aria-label="Inicio" className="flex items-center transition-colors hover:text-foreground">
        <Home className="size-4" />
      </Link>
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1
        return (
          <span key={item.label} className="flex items-center">
            <span className="mx-1.5">/</span>
            {item.to && !isLast ? (
              <Link
                to={item.to as RoutePaths<RegisteredRouter['routeTree']>}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'font-medium text-foreground' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
