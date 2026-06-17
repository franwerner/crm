// eslint-disable-next-line boundaries/element-types
import { useUpdateProject } from '@features/projects/hooks/use-project-mutations'
import { ProjectInfoPanel } from '@features/projects/components/project-detail/summary/project-info-panel'
import { ProjectProvenancePanel } from '@features/projects/components/project-detail/summary/project-provenance-panel'
import type { ProjectView } from '@shared/api/types/ProjectView'

type Props = {
  project: ProjectView
}

export function ProjectSummaryTab({ project }: Props) {
  const { updateProject, isPending } = useUpdateProject(project.id)

  return (
    <div className="flex flex-col gap-6">
      <ProjectInfoPanel
        project={project}
        onPatch={updateProject}
        isPending={isPending}
      />
      <ProjectProvenancePanel project={project} />
    </div>
  )
}
