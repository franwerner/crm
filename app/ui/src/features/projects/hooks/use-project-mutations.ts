import { toast } from 'sonner'
import { usePostProjects } from '@shared/api/hooks/usePostProjects'
import { usePatchProjectsId } from '@shared/api/hooks/usePatchProjectsId'
import { getProjectsQueryKey } from '@shared/api/hooks/useGetProjects'
import { getProjectsIdQueryKey } from '@shared/api/hooks/useGetProjectsId'
import { queryClient } from '@shared/lib/config/query-client'
import { toUserMessage } from '@shared/lib/utils/problem'
import type { UpdateProjectBody } from '@shared/api/types/UpdateProjectBody'
import type { ProjectCreateFormValues } from '@features/projects/constants/project.form'

export function useCreateProject() {
  const mutation = usePostProjects()

  async function createProject(data: ProjectCreateFormValues) {
    await mutation.mutateAsync({ data })
    await queryClient.invalidateQueries({ queryKey: getProjectsQueryKey() })
    toast.success('Proyecto creado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    createProject,
    isPending: mutation.isPending,
    errorMessage,
  }
}

export function useUpdateProject(projectId: string) {
  const mutation = usePatchProjectsId()

  async function updateProject(data: UpdateProjectBody) {
    await mutation.mutateAsync({ id: projectId, data })
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getProjectsIdQueryKey(projectId) }),
      queryClient.invalidateQueries({ queryKey: getProjectsQueryKey() }),
    ])
    toast.success('Proyecto actualizado')
  }

  const errorMessage = mutation.error ? toUserMessage(mutation.error) : null

  return {
    updateProject,
    isPending: mutation.isPending,
    errorMessage,
  }
}
