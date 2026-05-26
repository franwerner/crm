import { useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import type { UpdateContactBody } from '@shared/api/types/UpdateContactBody'
import type { ContactView } from '@shared/api/types/ContactView'
import { contactEditFields } from '@features/contacts/constants/contact-edit.form'
import { InlineField } from '@shared/ui/inline-field'
import { toFieldDef } from '@shared/lib/form-view/types'
import { makeValues } from './contact-field-mappers'

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
  const values = makeValues(contact)
  const fields = contactEditFields
    .map(toFieldDef)
    .filter((f) => MAIN_KEYS.includes(f.key) && (!f.visible || f.visible(values)))

  const handlePatch = useCallback(
    (partial: Partial<UpdateContactBody>) => onPatch(partial),
    [onPatch],
  )

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Datos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {fields.map((field) => (
          <InlineField
            key={field.key}
            field={field}
            currentValue={values[field.key]}
            onPatch={handlePatch}
            isPending={isPending}
          />
        ))}
      </CardContent>
    </Card>
  )
}
