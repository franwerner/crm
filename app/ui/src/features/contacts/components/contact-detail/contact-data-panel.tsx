import { useCallback } from 'react'
import { PanelCard } from '@shared/ui/panel-card'
import type { UpdateContactBody } from '@shared/api/types/UpdateContactBody'
import type { ContactView } from '@shared/api/types/ContactView'
import { contactEditFields } from '@features/contacts/constants/contact-edit.form'
import { InlineField } from '@shared/ui/inline-field'
import { toFieldDef } from '@shared/lib/form-view/types'

type Props = {
  contact: ContactView
  onPatch: (partial: Partial<UpdateContactBody>) => void
  isPending: boolean
}

const MAIN_KEYS: ReadonlyArray<keyof UpdateContactBody> = [
  'name',
  'contactType',
  'sex',
  'sourceChannel',
  'interestLevel',
  'notes',
]

export function ContactDataPanel({ contact, onPatch, isPending }: Props) {
  const fields = contactEditFields
    .map(toFieldDef)
    .filter((f) => MAIN_KEYS.includes(f.key) && (!f.visible || f.visible(contact)))

  const handlePatch = useCallback(
    (partial: Partial<UpdateContactBody>) => onPatch(partial),
    [onPatch],
  )

  return (
    <PanelCard title="Datos" contentClassName="flex flex-col divide-y divide-border">
      {fields.map((field) => (
        <InlineField
          key={field.key}
          field={field}
          currentValue={contact[field.key]}
          onPatch={handlePatch}
          isPending={isPending}
        />
      ))}
    </PanelCard>
  )
}
