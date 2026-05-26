import { Link } from '@tanstack/react-router'
import { Briefcase, Users, Contact, Settings } from 'lucide-react'
import { Logo } from '@shared/ui/logo'

const navItems = [
  { to: '/contacts', label: 'Contactos', icon: Contact },
  { to: '/projects', label: 'Proyectos', icon: Briefcase },
  { to: '/users', label: 'Usuarios', icon: Users },
] as const

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 flex-col gap-4 border-[1.5px] bg-card px-5 py-6">
      <Logo className="px-2" />
      <nav className="flex flex-col gap-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-transparent px-3 py-2 text-sm text-foreground transition-colors"
            inactiveProps={{ className: 'hover:bg-muted' }}
            activeProps={{ className: 'bg-primary border-brand font-semibold shadow-brutal-sm' }}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col gap-2">
        <Link
          to="/settings"
          className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-transparent px-3 py-2 text-sm text-foreground transition-colors"
          inactiveProps={{ className: 'hover:bg-muted' }}
          activeProps={{ className: 'bg-primary border-brand font-semibold shadow-brutal-sm' }}
        >
          <Settings className="size-4 shrink-0" />
          Configuración
        </Link>
      </nav>
    </aside>
  )
}
