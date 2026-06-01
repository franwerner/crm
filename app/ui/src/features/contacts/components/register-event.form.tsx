import type {
  RegisterEventBody,
  RegisterEventBodyEventTypeEnumKey,
} from '@shared/api/types/RegisterEventBody'
import type { ContactViewPipelineStateEnumKey } from '@shared/api/types/ContactView'
import type { FormDescriptor } from '@shared/lib/form-view/types'
import { Badge } from '@shared/ui/badge'
import { eventTypeOptions, pipelineStateLabels } from '@features/contacts/constants/contacts.options'
import { allowedEventsForState, applyTransition } from '@features/contacts/constants/pipeline-policy'
import { pipelineStateBadge } from '@features/contacts/constants/status-color-badge.constat'

export function makeRegisterEventForm(
  pipelineState: ContactViewPipelineStateEnumKey,
): FormDescriptor<RegisterEventBody> {
  const allowed = allowedEventsForState(pipelineState) as readonly string[]
  const filteredOptions = eventTypeOptions.filter((o) => allowed.includes(o.value))

  return {
    name: 'register-event',
    fields: [
      {
        key: 'eventType',
        label: 'Tipo de evento',
        widget: 'select',
        required: true,
        options: filteredOptions,
        placeholder: 'Seleccionar tipo…',
        extra: (values) => {
          const selected = values.eventType as RegisterEventBodyEventTypeEnumKey | undefined
          if (!selected) return null
          const target = applyTransition(pipelineState, selected)
          if (!target) {
            return (
              <div className="flex items-center gap-2 text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                <span>No cambia el estado del contacto.</span>
              </div>
            )
          }
          return (
            <div className="flex items-center gap-2 text-[length:var(--ds-font-size-xs)] text-muted-foreground">
              <span>El contacto pasará a</span>
              <Badge variant={pipelineStateBadge[target]}>{pipelineStateLabels[target]}</Badge>
            </div>
          )
        },
      },
      {
        key: 'detail',
        label: 'Detalle',
        widget: 'textarea',
        placeholder: 'Notas del evento…',
      },
      {
        key: 'occurredAt',
        label: 'Fecha y hora',
        widget: 'datetime',
        required: true,
      },
    ],
  }
}
