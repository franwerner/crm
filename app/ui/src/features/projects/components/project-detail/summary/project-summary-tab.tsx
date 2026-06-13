// eslint-disable-next-line boundaries/element-types
import { useUpdateProject } from '@features/projects/hooks/use-project-mutations'
import { ProjectInfoPanel } from '@features/projects/components/project-detail/summary/project-info-panel'
import type { ProjectView } from '@shared/api/types/ProjectView'

type Props = {
  project: ProjectView
}

export function ProjectSummaryTab({ project }: Props) {
  const { updateProject, isPending } = useUpdateProject(project.id)

  return (
    <ProjectInfoPanel
      project={project}
      onPatch={updateProject}
      isPending={isPending}
    />
  )
}
