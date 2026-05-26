import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { projectStatusLabels } from '@features/projects/constants/projects.options'
import { formatDateTime } from '@shared/lib/utils/date'
import type { ProjectListItemStatusEnumKey } from '@shared/api/types/ProjectListItem'
import type { ProjectStateChangeView } from '@shared/api/types/ProjectStateChangeView'

type Props = {
  stateChanges: ProjectStateChangeView[]
  isLoading: boolean
}

export function ProjectStateChangesPanel({ stateChanges, isLoading }: Props) {
  const sorted = [...stateChanges].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Historial de estado</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
        ) : sorted.length === 0 ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
            Sin cambios de estado registrados.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {sorted.map((change) => (
              <li key={change.id} className="py-2.5 flex flex-col gap-0.5">
                <span className="text-[length:var(--ds-font-size-sm)] text-foreground">
                  {projectStatusLabels[change.previousState as ProjectListItemStatusEnumKey]} → {projectStatusLabels[change.nextState as ProjectListItemStatusEnumKey]}
                </span>
                <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                  {formatDateTime(change.changedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
