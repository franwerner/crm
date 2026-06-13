import { useParams } from '@tanstack/react-router'
import { useProject } from '@features/projects/hooks/use-project'
import { ProjectDetailHeader } from '@features/projects/components/project-detail/project-detail-header'
import { ProjectSummaryBar } from '@features/projects/components/project-detail/project-summary-bar'
import { ProjectDetailTabs } from '@features/projects/components/project-detail/project-detail-tabs'

export function ProjectDetailPage() {
  const { id } = useParams({ from: '/_authenticated/projects/$id' })
  const { project, isLoading } = useProject(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground text-[length:var(--ds-font-size-sm)]">Cargando…</span>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <ProjectDetailHeader project={project} />
      <ProjectSummaryBar project={project} />
      <ProjectDetailTabs project={project} />
    </div>
  )
}
