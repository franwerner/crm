import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, PowerOff } from 'lucide-react'
import { PanelCard } from '@shared/ui/panel-card'
import { Button } from '@shared/ui/button'
import { Badge } from '@shared/ui/badge'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import { EntityCreateModal } from '@shared/ui/entity-create-modal'
import { EntityEditModal } from '@shared/ui/entity-edit-modal'
import { postAnalysisTemplatesMutationRequestSchema } from '@shared/api/schemas/postAnalysisTemplatesSchema'
import { patchAnalysisTemplatesIdMutationRequestSchema } from '@shared/api/schemas/patchAnalysisTemplatesIdSchema'
import { templateCreateForm } from '@features/settings/constants/template.form'
import { templateEditForm } from '@features/settings/constants/template-edit.form'
import { useTemplates, type AnalysisTemplate } from '@features/settings/hooks/use-templates'
import {
  useCreateTemplate,
  useUpdateTemplate,
  useDeactivateTemplate,
} from '@features/settings/hooks/use-template-mutations'
import type { PostAnalysisTemplatesMutationRequest } from '@shared/api/types/PostAnalysisTemplates'
import type { PatchAnalysisTemplatesIdMutationRequest } from '@shared/api/types/PatchAnalysisTemplatesId'

const createDefaultValues: PostAnalysisTemplatesMutationRequest = {
  name: '',
  rubro: '',
  prompt: '',
  modelProvider: '',
}

export function TemplatesListPanel() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AnalysisTemplate | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<AnalysisTemplate | null>(null)

  const { templates, isLoading, isError, refetch } = useTemplates()

  const { create, isPending: isCreating, errorMessage: createError } = useCreateTemplate()
  const { update, isPending: isUpdating, errorMessage: updateError } = useUpdateTemplate()
  const { deactivate, isPending: isDeactivating } = useDeactivateTemplate()

  async function handleCreate(data: PostAnalysisTemplatesMutationRequest) {
    await create(data)
  }

  async function handleUpdate(data: PatchAnalysisTemplatesIdMutationRequest) {
    if (!editTarget) return
    await update(editTarget.id, data)
    setEditTarget(null)
  }

  async function handleConfirmDeactivate() {
    if (!deactivateTarget) return
    try {
      await deactivate(deactivateTarget.id)
    } catch {
      toast.error('Error al desactivar el template')
    } finally {
      setDeactivateTarget(null)
    }
  }

  return (
    <>
      <PanelCard
        title="Templates de análisis"
        action={
          <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus />
            Nuevo template
          </Button>
        }
      >
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-md border border-border bg-muted"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-[length:var(--ds-font-size-sm)] text-destructive">
              No se pudo cargar la lista de templates.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-start gap-3 py-2">
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
              No hay templates configurados todavía.
            </p>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              Crear el primer template
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {templates.map((tpl) => (
              <li key={tpl.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[length:var(--ds-font-size-sm)] font-[var(--ds-font-weight-semibold)] text-foreground">
                    {tpl.name}
                  </span>
                  {tpl.rubro && (
                    <span className="truncate text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                      {tpl.rubro}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={tpl.isActive ? 'success' : 'neutral'}>
                    {tpl.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditTarget(tpl)}
                    title="Editar template"
                  >
                    <Pencil className="size-4" />
                  </Button>

                  {tpl.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeactivateTarget(tpl)}
                      title="Desactivar template"
                    >
                      <PowerOff className="size-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      {/* A.5 — Create modal */}
      <EntityCreateModal<PostAnalysisTemplatesMutationRequest>
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nuevo template"
        description="Creá un template de análisis para enriquecer contactos."
        size="lg"
        descriptor={templateCreateForm}
        schema={postAnalysisTemplatesMutationRequestSchema}
        defaultValues={createDefaultValues}
        onSubmit={handleCreate}
        submitLabel="Crear template"
        pendingLabel="Creando…"
        isPending={isCreating}
        errorMessage={createError}
      />

      {/* A.5 — Edit modal */}
      {editTarget && (
        <EntityEditModal<PatchAnalysisTemplatesIdMutationRequest>
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          title="Editar template"
          description="Modificá los datos del template."
          size="lg"
          descriptor={templateEditForm}
          schema={patchAnalysisTemplatesIdMutationRequestSchema}
          defaultValues={{
            name: editTarget.name,
            rubro: editTarget.rubro,
            prompt: editTarget.prompt,
            modelProvider: editTarget.modelProvider,
          }}
          onSubmit={handleUpdate}
          submitLabel="Guardar cambios"
          pendingLabel="Guardando…"
          isPending={isUpdating}
          errorMessage={updateError}
        />
      )}

      {/* Deactivate confirmation — uses DeleteDialog since deactivation is irreversible from UI */}
      <DeleteDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => { if (!open) setDeactivateTarget(null) }}
        title="Desactivar template"
        content={
          <p className="text-[length:var(--ds-font-size-sm)]">
            ¿Desactivar el template <strong>{deactivateTarget?.name}</strong>? Dejará de estar disponible para nuevos análisis.
          </p>
        }
        onDeleted={handleConfirmDeactivate}
        isDeleting={isDeactivating}
      />
    </>
  )
}
