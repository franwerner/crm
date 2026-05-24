import { useNavigate } from '@tanstack/react-router'
import { usePostAuthLogout } from '@shared/api/hooks/usePostAuthLogout'
import { getAuthMeQueryKey } from '@shared/api/hooks/useGetAuthMe'
import { queryClient } from '@shared/lib/query-client'
import { Button } from '@shared/ui/button'
import { useAuth } from './auth-context/use.auth-context'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const logout = usePostAuthLogout()

  async function handleLogout() {
    await logout.mutateAsync()
    queryClient.removeQueries({ queryKey: getAuthMeQueryKey() })
    await navigate({ to: '/login' })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">CRM</h1>
      <p>{user?.name}</p>
      <p className="text-sm text-muted-foreground">{user?.email}</p>
      <Button variant="outline" onClick={handleLogout} disabled={logout.isPending}>
        {logout.isPending ? 'Cerrando sesión...' : 'Logout'}
      </Button>
    </main>
  )
}
