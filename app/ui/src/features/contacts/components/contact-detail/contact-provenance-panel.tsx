import { PanelCard } from '@shared/ui/panel-card'
import { Badge } from '@shared/ui/badge'
import type { ContactView } from '@shared/api/types/ContactView'
import { pipelineStateLabels } from '@features/contacts/constants/contacts.options'
import { pipelineStateBadge } from '@features/contacts/constants/status-color-badge.constat'
import { formatDate, formatDateTime } from '@shared/lib/utils/date'

type Props = {
  contact: ContactView
}

export function ContactProvenancePanel({ contact }: Props) {
  return (
    <PanelCard title="Procedencia" contentClassName="flex flex-col divide-y divide-border">
        <div className="flex justify-between items-center gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Estado</span>
          <Badge variant={pipelineStateBadge[contact.pipelineState]}>
            {pipelineStateLabels[contact.pipelineState]}
          </Badge>
        </div>
        <div className="flex justify-between items-center gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Creado por</span>
          <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">
            {contact.creator?.name ?? '—'}
          </span>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Alta</span>
          <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">{formatDate(contact.createdAt)}</span>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Actualización</span>
          <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">{formatDateTime(contact.updatedAt)}</span>
        </div>
    </PanelCard>
  )
}
