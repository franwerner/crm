import { PanelCard } from '@shared/ui/panel-card'
import type { ProjectView } from '@shared/api/types/ProjectView'
import { formatDate, formatDateTime } from '@shared/lib/utils/date'

type Props = {
  project: ProjectView
}

export function ProjectProvenancePanel({ project }: Props) {
  return (
    <PanelCard title="Procedencia" contentClassName="flex flex-col divide-y divide-border">
      <div className="flex justify-between items-center gap-4 py-1.5">
        <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Creado por</span>
        <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">
          {project.creator?.name ?? '—'}
        </span>
      </div>
      <div className="flex justify-between gap-4 py-1.5">
        <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Alta</span>
        <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">{formatDate(project.createdAt)}</span>
      </div>
      <div className="flex justify-between gap-4 py-1.5">
        <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Actualización</span>
        <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">{formatDateTime(project.updatedAt)}</span>
      </div>
    </PanelCard>
  )
}
