import { useGetContactsId } from '@shared/api/hooks/useGetContactsId'
import { useGetContactsIdEvents } from '@shared/api/hooks/useGetContactsIdEvents'
import { useGetContactsIdStateChanges } from '@shared/api/hooks/useGetContactsIdStateChanges'

export function useContact(id: string) {
  const { data, isLoading, isError } = useGetContactsId(id)

  return {
    contact: data ?? null,
    isLoading,
    isError,
  }
}

export function useContactEvents(id: string) {
  const { data, isLoading } = useGetContactsIdEvents(id)

  return {
    events: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
  }
}

export function useContactStateChanges(id: string) {
  const { data, isLoading } = useGetContactsIdStateChanges(id)

  return {
    stateChanges: data?.items ?? [],
    isLoading,
  }
}
