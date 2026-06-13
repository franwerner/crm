import { PanelCard } from '@shared/ui/panel-card'
import { Badge } from '@shared/ui/badge'
import { Timeline, TimelineItem, TimelineContent, TimelineMeta, TimelineQuote } from '@shared/ui/timeline'
import { projectStatusBadge, projectStatusLabels } from '@features/projects/constants/projects.options'
import { formatDateTime } from '@shared/lib/utils/date'
import type { ProjectListItemStatusEnumKey } from '@shared/api/types/ProjectListItem'
import type { ProjectStateChangeView } from '@shared/api/types/ProjectStateChangeView'

type Props = {
  stateChanges: ProjectStateChangeView[]
  isLoading: boolean
}

function dotVariant(change: ProjectStateChangeView) {
  if (change.nextState === 'Cancelled') return 'warn'
  return change.causeKind === 'system' ? 'system' : 'user'
}

export function ProjectStateChangesPanel({ stateChanges, isLoading }: Props) {
  const sorted = [...stateChanges].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  )

  return (
    <PanelCard title="Historial de estado">
        {isLoading ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
        ) : sorted.length === 0 ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
            Sin cambios de estado registrados.
          </p>
        ) : (
          <Timeline>
            {sorted.map((change) => (
              <TimelineItem key={change.id} dot={dotVariant(change)}>
                <TimelineContent>
                  <span className="flex items-center gap-1.5">
                    <Badge variant={projectStatusBadge[change.previousState as ProjectListItemStatusEnumKey]}>
                      {projectStatusLabels[change.previousState as ProjectListItemStatusEnumKey]}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant={projectStatusBadge[change.nextState as ProjectListItemStatusEnumKey]}>
                      {projectStatusLabels[change.nextState as ProjectListItemStatusEnumKey]}
                    </Badge>
                  </span>
                  {change.note && <TimelineQuote>{change.note}</TimelineQuote>}
                  <TimelineMeta>
                    {formatDateTime(change.changedAt)}
                  </TimelineMeta>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
    </PanelCard>
  )
}
