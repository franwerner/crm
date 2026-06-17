import { TemplatesListPanel } from '@features/settings/components/templates-list-panel'

export function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[length:var(--ds-font-size-xl)] font-[var(--ds-font-weight-semibold)] text-foreground">
          Templates de análisis
        </h1>
        <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
          Configurá los templates que se usan para enriquecer contactos con IA.
        </p>
      </div>

      <TemplatesListPanel />
    </div>
  )
}
