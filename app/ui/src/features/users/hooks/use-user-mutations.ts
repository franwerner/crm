import { toast } from 'sonner'
import { usePostUsers } from '@shared/api/hooks/usePostUsers'
import { usePatchUsersId } from '@shared/api/hooks/usePatchUsersId'
import { useDeleteUsersId } from '@shared/api/hooks/useDeleteUsersId'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { CreateUserFormValues, UpdateUserFormValues } from '@features/users/types/users.types'

export function useCreateUser() {
  const mutation = usePostUsers()

  async function createUser(data: CreateUserFormValues) {
    await mutation.mutateAsync({ data })
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Usuario creado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    createUser,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useUpdateUser() {
  const mutation = usePatchUsersId()

  async function updateUser(id: string, data: UpdateUserFormValues) {
    await mutation.mutateAsync({ id, data })
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Usuario actualizado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    updateUser,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useDeleteUser() {
  const mutation = useDeleteUsersId()

  async function deleteUser(id: string) {
    await mutation.mutateAsync({ id })
    await queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('Usuario eliminado')
  }

  return {
    deleteUser,
    isPending: mutation.isPending,
  }
}
