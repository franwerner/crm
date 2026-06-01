import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { projectStatusBadge, projectStatusLabels } from '@features/projects/constants/projects.options'
import { useDeleteProject } from '@features/projects/hooks/use-project-mutations'
import { useProjectStateChange } from '@features/projects/hooks/use-project-state-change-mutation'
import { StateChangeAction } from '@features/projects/components/project-detail/state-change-action'
import type { ProjectView } from '@shared/api/types/ProjectView'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { DeleteDialog } from '@shared/ui/delete-dialog'

type Props = {
  project: ProjectView
}

export function ProjectDetailHeader({ project }: Props) {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { deleteProject, isPending: isDeleting } = useDeleteProject(project.id)
  const { changeState, isPending: isChangingState } = useProjectStateChange(project.id)

  async function handleConfirmDelete() {
    try {
      await deleteProject()
      setDeleteOpen(false)
      navigate({ to: '/projects' })
    } catch {
      toast.error('Error al eliminar el proyecto')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[length:var(--ds-font-size-xl)] font-[var(--ds-font-weight-semibold)] text-foreground leading-tight">
            {project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant={projectStatusBadge[project.status]}>
              {projectStatusLabels[project.status]}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StateChangeAction
            status={project.status}
            onChangeState={changeState}
            isPending={isChangingState}
          />
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Eliminar
          </Button>
        </div>
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar proyecto"
        content={`¿Eliminar el proyecto ${project.name}? Esta acción no se puede deshacer.`}
        onDeleted={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
