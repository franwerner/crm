import { useGetAuthMe } from '@shared/api/hooks/useGetAuthMe'
import { type ReactNode } from 'react'
import { AuthContext } from './value.auth-context'



export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useGetAuthMe({
    query: {
      retry: false,
      refetchOnWindowFocus: true,
    },
  })

  return (
    <AuthContext.Provider value={{ user: data, isAuthenticated: !!data, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

