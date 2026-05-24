import { useNavigate } from '@tanstack/react-router'
import { LogOut, User } from 'lucide-react'
import { useGetAuthMe, getAuthMeQueryKey } from '@shared/api/hooks/useGetAuthMe'
import { usePostAuthLogout } from '@shared/api/hooks/usePostAuthLogout'
import { queryClient } from '@shared/lib/query-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu'
import { Button } from '@shared/ui/button'

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
          <Button variant="ghost" size="icon" aria-label="Menú de usuario">
            <User className="size-4" />
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
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
