import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { Button } from '@shared/ui/button'

// Required contact field names — at least one must be mapped.
const REQUIRED_FIELDS = ['email', 'phone'] as const

export interface MappingStepData {
  mapping: Record<string, string>
}

interface MappingStepProps {
  columnHeaders: string[]
  // Mapping is stored locally and passed to the parent; the PATCH is fired in the template step
  // so analyzeOnComplete/enrichmentTemplateId can be sent together in a single request.
  onComplete: (data: MappingStepData) => void
}

export function MappingStep({ columnHeaders, onComplete }: MappingStepProps) {
  // Maps header → contact field. Starts empty so user must explicitly choose.
  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    Object.fromEntries(columnHeaders.map((h) => [h, ''])),
  )

  function handleSelect(header: string, field: string) {
    setMapping((prev) => ({ ...prev, [header]: field }))
  }

  // At least one of email or phone must be mapped to proceed.
  const mappedValues = Object.values(mapping).filter(Boolean)
  const hasRequiredField = REQUIRED_FIELDS.some((f) => mappedValues.includes(f))

  function handleNext() {
    // Only pass headers that were explicitly mapped
    const finalMapping: Record<string, string> = {}
    for (const [header, field] of Object.entries(mapping)) {
      if (field) finalMapping[header] = field
    }
    onComplete({ mapping: finalMapping })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
        Mapeá las columnas del archivo a los campos de contacto. Al menos email o teléfono es requerido.
      </p>

      <ul className="flex flex-col divide-y divide-border rounded-[var(--ds-radius-md)] border border-border">
        {columnHeaders.map((header) => (
          <li key={header} className="flex items-center justify-between gap-4 px-4 py-3">
            <span className="min-w-0 flex-1 truncate text-[length:var(--ds-font-size-sm)] text-foreground">
              {header}
            </span>
            <Select
              value={mapping[header] ?? ''}
              onValueChange={(value) => handleSelect(header, value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="No mapear" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Teléfono</SelectItem>
              </SelectContent>
            </Select>
          </li>
        ))}
      </ul>

      {!hasRequiredField && (
        <p className="text-[length:var(--ds-font-size-xs)] text-warning">
          Mapeá al menos una columna a email o teléfono para continuar.
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!hasRequiredField}>
          Siguiente
        </Button>
      </div>
    </div>
  )
}
