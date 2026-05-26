import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { Avatar } from '@shared/ui/avatar'
import type { ContactView } from '@shared/api/types/ContactView'
import { pipelineStateLabels, sourceChannelLabels, interestLevelLabels } from '@features/contacts/constants/contacts.options'
import { formatDate, formatDateTime } from '@shared/lib/utils/date'

type Props = {
  contact: ContactView
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">{label}</span>
      <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">{children}</span>
    </div>
  )
}

export function ContactInfoPanel({ contact }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Datos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <InfoRow label="Pipeline">{pipelineStateLabels[contact.pipelineState]}</InfoRow>
        <InfoRow label="Canal">
          {contact.sourceChannel ? sourceChannelLabels[contact.sourceChannel] : '—'}
        </InfoRow>
        <InfoRow label="Interés">
          {contact.interestLevel ? interestLevelLabels[contact.interestLevel] : '—'}
        </InfoRow>
      </CardContent>

      <CardHeader className="pb-2 pt-4 border-t border-border">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Procedencia</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <InfoRow label="Creado por">
          {contact.creator ? (
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={contact.creator.name} size="sm" />
              {contact.creator.name}
            </span>
          ) : (
            '—'
          )}
        </InfoRow>
        <InfoRow label="Alta">{formatDate(contact.createdAt)}</InfoRow>
        <InfoRow label="Actualización">{formatDateTime(contact.updatedAt)}</InfoRow>
      </CardContent>
    </Card>
  )
}
