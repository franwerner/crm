import { toast } from 'sonner'
import { usePostContacts } from '@shared/api/hooks/usePostContacts'
import { usePostContactsBulkDelete } from '@shared/api/hooks/usePostContactsBulkDelete'
import { usePatchContactsId } from '@shared/api/hooks/usePatchContactsId'
import { usePostContactsIdEvents } from '@shared/api/hooks/usePostContactsIdEvents'
import { usePostContactsIdChannels } from '@shared/api/hooks/usePostContactsIdChannels'
import { usePatchContactsIdChannelsChannelid } from '@shared/api/hooks/usePatchContactsIdChannelsChannelid'
import { useDeleteContactsIdChannelsChannelid } from '@shared/api/hooks/useDeleteContactsIdChannelsChannelid'
import { getContactsQueryKey } from '@shared/api/hooks/useGetContacts'
import { getContactsIdQueryKey } from '@shared/api/hooks/useGetContactsId'
import { getContactsIdEventsQueryKey } from '@shared/api/hooks/useGetContactsIdEvents'
import { getContactsIdStateChangesQueryKey } from '@shared/api/hooks/useGetContactsIdStateChanges'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { CreateContactFormValues } from '@features/contacts/types/contacts.types'
import type { RegisterEventBody } from '@shared/api/types/RegisterEventBody'
import type { UpdateContactBody } from '@shared/api/types/UpdateContactBody'
import type { AddChannelBody } from '@shared/api/types/AddChannelBody'
import type { UpdateChannelBody } from '@shared/api/types/UpdateChannelBody'

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
  const mutation = usePostContactsBulkDelete()

  async function bulkDelete(ids: string[]) {
    await mutation.mutateAsync({ data: { ids } })
    await queryClient.invalidateQueries({ queryKey: getContactsQueryKey() })
    toast.success(`${ids.length} ${ids.length === 1 ? 'contacto eliminado' : 'contactos eliminados'}`)
  }

  return {
    bulkDelete,
    isPending: mutation.isPending,
  }
}

export function useRegisterContactEvent(contactId: string) {
  const mutation = usePostContactsIdEvents()

  async function registerEvent(data: RegisterEventBody) {
    await mutation.mutateAsync({ id: contactId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getContactsIdQueryKey(contactId) }),
      queryClient.invalidateQueries({ queryKey: getContactsIdEventsQueryKey(contactId) }),
      queryClient.invalidateQueries({ queryKey: getContactsIdStateChangesQueryKey(contactId) }),
    ])
    toast.success('Evento registrado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    registerEvent,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useUpdateContact(contactId: string) {
  const mutation = usePatchContactsId()

  async function updateContact(data: UpdateContactBody) {
    await mutation.mutateAsync({ id: contactId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getContactsIdQueryKey(contactId) }),
      queryClient.invalidateQueries({ queryKey: getContactsQueryKey() }),
    ])
    toast.success('Contacto actualizado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    updateContact,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useAddChannel(contactId: string) {
  const mutation = usePostContactsIdChannels()

  async function addChannel(data: AddChannelBody) {
    await mutation.mutateAsync({ id: contactId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getContactsIdQueryKey(contactId) }),
      queryClient.invalidateQueries({ queryKey: getContactsQueryKey() }),
    ])
    toast.success('Canal agregado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    addChannel,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useUpdateChannel(contactId: string) {
  const mutation = usePatchContactsIdChannelsChannelid()

  async function updateChannel(channelId: string, data: UpdateChannelBody) {
    await mutation.mutateAsync({ id: contactId, channelId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getContactsIdQueryKey(contactId) }),
      queryClient.invalidateQueries({ queryKey: getContactsQueryKey() }),
    ])
    toast.success('Canal actualizado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    updateChannel,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useRemoveChannel(contactId: string) {
  const mutation = useDeleteContactsIdChannelsChannelid()

  async function removeChannel(channelId: string) {
    await mutation.mutateAsync({ id: contactId, channelId })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getContactsIdQueryKey(contactId) }),
      queryClient.invalidateQueries({ queryKey: getContactsQueryKey() }),
    ])
    toast.success('Canal eliminado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    removeChannel,
    isPending: mutation.isPending,
    errorMessage,
  }
}
