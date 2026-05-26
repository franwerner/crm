import { toast } from 'sonner'
import { useGetContactsIdAssignments, getContactsIdAssignmentsQueryKey } from '@shared/api/hooks/useGetContactsIdAssignments'
import { usePostContactsIdAssignments } from '@shared/api/hooks/usePostContactsIdAssignments'
import { usePatchContactsIdAssignmentsUserid } from '@shared/api/hooks/usePatchContactsIdAssignmentsUserid'
import { useDeleteContactsIdAssignmentsUserid } from '@shared/api/hooks/useDeleteContactsIdAssignmentsUserid'
import { getContactsIdQueryKey } from '@shared/api/hooks/useGetContactsId'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { AddAssignmentBody } from '@shared/api/types/AddAssignmentBody'
import type { UpdateAssignmentRoleBody } from '@shared/api/types/UpdateAssignmentRoleBody'

export function useContactAssignments(contactId: string) {
  const { data, isLoading } = useGetContactsIdAssignments(contactId)
  return {
    assignments: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
  }
}

async function invalidateAssignments(contactId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: getContactsIdAssignmentsQueryKey(contactId) }),
    queryClient.invalidateQueries({ queryKey: getContactsIdQueryKey(contactId) }),
  ])
}

export function useAddAssignment(contactId: string) {
  const mutation = usePostContactsIdAssignments()

  async function addAssignment(data: AddAssignmentBody) {
    await mutation.mutateAsync({ id: contactId, data })
    await invalidateAssignments(contactId)
    toast.success('Asignación agregada')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    addAssignment,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useUpdateAssignmentRole(contactId: string) {
  const mutation = usePatchContactsIdAssignmentsUserid()

  async function updateAssignmentRole(userId: string, data: UpdateAssignmentRoleBody) {
    await mutation.mutateAsync({ id: contactId, userId, data })
    await invalidateAssignments(contactId)
    toast.success('Rol actualizado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    updateAssignmentRole,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useRemoveAssignment(contactId: string) {
  const mutation = useDeleteContactsIdAssignmentsUserid()

  async function removeAssignment(userId: string) {
    await mutation.mutateAsync({ id: contactId, userId })
    await invalidateAssignments(contactId)
    toast.success('Asignación eliminada')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    removeAssignment,
    isPending: mutation.isPending,
    errorMessage,
  }
}
