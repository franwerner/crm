import { toast } from 'sonner'
import { usePostContacts } from '@shared/api/hooks/usePostContacts'
import { useDeleteContactsId } from '@shared/api/hooks/useDeleteContactsId'
import { usePatchContactsIdState } from '@shared/api/hooks/usePatchContactsIdState'
import { getContactsQueryKey } from '@shared/api/hooks/useGetContacts'
import { queryClient } from '@shared/lib/query-client'
import { toUserMessage } from '@shared/lib/problem'
import type { ContactPipelineState, CreateContactFormValues } from '@features/contacts/contacts.types'

export function useCreateContact() {
  const mutation = usePostContacts()

  async function createContact(data: CreateContactFormValues) {
    await mutation.mutateAsync({ data })
    await queryClient.invalidateQueries({ queryKey: getContactsQueryKey() })
    toast.success('Contacto creado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    createContact,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useBulkDeleteContacts() {
  const mutation = useDeleteContactsId()

  async function bulkDelete(ids: string[]) {
    await Promise.all(ids.map((id) => mutation.mutateAsync({ id })))
    await queryClient.invalidateQueries({ queryKey: getContactsQueryKey() })
    toast.success(`${ids.length} ${ids.length === 1 ? 'contacto eliminado' : 'contactos eliminados'}`)
  }

  return {
    bulkDelete,
    isPending: mutation.isPending,
  }
}

export function useBulkChangeState() {
  const mutation = usePatchContactsIdState()

  async function bulkChangeState(ids: string[], newState: ContactPipelineState) {
    await Promise.all(ids.map((id) => mutation.mutateAsync({ id, data: { newState } })))
    await queryClient.invalidateQueries({ queryKey: getContactsQueryKey() })
    toast.success(`Estado actualizado a ${newState}`)
  }

  return {
    bulkChangeState,
    isPending: mutation.isPending,
  }
}
