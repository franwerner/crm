import { useNavigate } from '@tanstack/react-router'
import { LogOut, ChevronDown } from 'lucide-react'
import { useGetAuthMe, getAuthMeQueryKey } from '@shared/api/hooks/useGetAuthMe'
import { usePostAuthLogout } from '@shared/api/hooks/usePostAuthLogout'
import { queryClient } from '@shared/lib/config/query-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu'
import { Button } from '@shared/ui/button'
import { Avatar } from '@shared/ui/avatar'

export function Header() {
  const { data: me } = useGetAuthMe()
  const navigate = useNavigate()
  const logout = usePostAuthLogout()

  async function handleLogout() {
    await logout.mutateAsync()
    queryClient.removeQueries({ queryKey: getAuthMeQueryKey() })
    await navigate({ to: '/login' })
  }

  return (
    <header className="flex h-14 items-center justify-end border-b border-border bg-card px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2" aria-label="Menú de usuario">
            <Avatar name={me?.name ?? ''} size="sm" />
            <span className="text-sm font-medium text-foreground">{me?.name}</span>
            <ChevronDown className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium text-foreground">{me?.name}</p>
            <p className="text-xs text-muted-foreground">{me?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={logout.isPending}
            onSelect={handleLogout}
          >
            <LogOut className="size-4" />
            {logout.isPending ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
            v{__APP_VERSION__}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
