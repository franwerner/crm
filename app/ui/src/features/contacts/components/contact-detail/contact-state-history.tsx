import { PanelCard } from '@shared/ui/panel-card'
import type { ContactStateChangeView } from '@shared/api/types/ContactStateChangeView'
import { pipelineStateLabels } from '@features/contacts/constants/contacts.options'
import { formatDateTime } from '@shared/lib/utils/date'

type Props = {
  stateChanges: ContactStateChangeView[]
}

export function ContactStateHistory({ stateChanges }: Props) {
  const sorted = [...stateChanges].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  )

  return (
    <PanelCard title="Historial de pipeline">
        {sorted.length === 0 ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
            Sin cambios de estado registrados.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {sorted.map((change) => (
              <li key={change.id} className="py-2.5 flex flex-col gap-0.5">
                <span className="text-[length:var(--ds-font-size-sm)] text-foreground">
                  {pipelineStateLabels[change.previousState]} → {pipelineStateLabels[change.nextState]}
                </span>
                <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                  {formatDateTime(change.changedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
    </PanelCard>
  )
}
