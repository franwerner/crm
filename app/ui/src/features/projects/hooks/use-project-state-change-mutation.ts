import { toast } from 'sonner'
import { usePostProjectsIdState } from '@shared/api/hooks/usePostProjectsIdState'
import { getProjectsIdQueryKey } from '@shared/api/hooks/useGetProjectsId'
import { getProjectsIdStateChangesQueryKey } from '@shared/api/hooks/useGetProjectsIdStateChanges'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { ChangeProjectStateBodyNewStateEnumKey } from '@shared/api/types/ChangeProjectStateBody'

export function useProjectStateChange(projectId: string) {
  const mutation = usePostProjectsIdState()

  async function changeState(newState: ChangeProjectStateBodyNewStateEnumKey) {
    await mutation.mutateAsync({ id: projectId, data: { newState } })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsIdStateChangesQueryKey(projectId) }),
    ])
    toast.success('Estado actualizado')
  }

  return {
    changeState,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toUserMessage(mutation.error) : null,
  }
}
