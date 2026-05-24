import { zodResolver } from '@hookform/resolvers/zod'
import { usePostAuthLogin } from '@shared/api/hooks/usePostAuthLogin'
import { getAuthMeQueryKey } from '@shared/api/hooks/useGetAuthMe'
import { postAuthLoginMutationRequestSchema } from '@shared/api/schemas/postAuthLoginSchema'
import { queryClient } from '@shared/lib/query-client'
import { toUserMessage } from '@shared/lib/problem'
import type { LoginFormValues } from '@features/auth/auth.types'

export const loginFormResolver = zodResolver(postAuthLoginMutationRequestSchema)

export function useLogin() {
  const mutation = usePostAuthLogin()

  async function login(credentials: LoginFormValues) {
    await mutation.mutateAsync({ data: credentials })
    await queryClient.invalidateQueries({ queryKey: getAuthMeQueryKey() })
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    login,
    isPending: mutation.isPending,
    errorMessage,
  }
}
