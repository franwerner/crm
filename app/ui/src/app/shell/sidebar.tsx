import { Link } from '@tanstack/react-router'
import { Users, Contact } from 'lucide-react'
import { cn } from '@shared/lib/cn'

const navItems = [
  { to: '/contacts', label: 'Contactos', icon: Contact },
  { to: '/users', label: 'Usuarios', icon: Users },
] as const

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-sm font-semibold tracking-wide text-foreground">CRM</span>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
            )}
            activeProps={{ className: 'bg-muted text-foreground font-medium' }}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
