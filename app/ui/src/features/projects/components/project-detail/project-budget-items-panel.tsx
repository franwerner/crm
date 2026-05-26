import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { Button } from '@shared/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { EntityCreateModal } from '@shared/ui/entity-create-modal'
import { EntityEditModal } from '@shared/ui/entity-edit-modal'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import type { ProjectBudgetItemView } from '@shared/api/types/ProjectBudgetItemView'
import {
  budgetItemCreateForm,
  budgetItemCreateFormSchema,
  budgetItemCreateDefaultValues,
} from '@features/projects/constants/project-budget-item.form'
import type { BudgetItemCreateFormValues } from '@features/projects/constants/project-budget-item.form'
import {
  budgetItemEditForm,
  budgetItemEditFormSchema,
  getBudgetItemEditDefaults,
} from '@features/projects/constants/project-budget-item-edit.form'
import type { BudgetItemEditFormValues } from '@features/projects/constants/project-budget-item-edit.form'

type Props = {
  budgetItems: ProjectBudgetItemView[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
  currency: string
  onAdd: (data: BudgetItemCreateFormValues) => Promise<void>
  onEdit: (itemId: string, data: BudgetItemEditFormValues) => Promise<void>
  onDelete: (itemId: string) => Promise<void>
  isAdding: boolean
  isUpdating: boolean
  isRemoving: boolean
  addError: string | null
  updateError: string | null
}

function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100)
}

export function ProjectBudgetItemsPanel({
  budgetItems,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  currency,
  onAdd,
  onEdit,
  onDelete,
  isAdding,
  isUpdating,
  isRemoving,
  addError,
  updateError,
}: Props) {
  const totalPages = Math.ceil(total / pageSize)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ProjectBudgetItemView | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectBudgetItemView | null>(null)

  async function handleAdd(data: BudgetItemCreateFormValues) {
    await onAdd(data)
  }

  async function handleEdit(data: BudgetItemEditFormValues) {
    if (!editTarget) return
    await onEdit(editTarget.id, data)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await onDelete(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-[length:var(--ds-font-size-md)]">Presupuesto</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3 w-3" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
          ) : budgetItems.length === 0 ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
              Sin ítems de presupuesto.
            </p>
          ) : (
            <>
              <table className="w-full text-[length:var(--ds-font-size-sm)]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-muted-foreground">Concepto</th>
                    <th className="py-2 text-right font-medium text-muted-foreground">Monto</th>
                    <th className="py-2 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {budgetItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 text-foreground">{item.concept}</td>
                      <td className="py-2 text-right text-foreground">
                        {formatMoney(item.amountMinor, currency)}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditTarget(item)} aria-label="Editar ítem">
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)} aria-label="Eliminar ítem">
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3">
                  <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                    Pág. {page} de {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => onPageChange(page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => onPageChange(page + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <EntityCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Agregar ítem de presupuesto"
        description="Agregar un ítem al presupuesto del proyecto"
        descriptor={budgetItemCreateForm}
        schema={budgetItemCreateFormSchema}
        defaultValues={budgetItemCreateDefaultValues}
        onSubmit={handleAdd}
        isPending={isAdding}
        errorMessage={addError}
      />

      {editTarget && (
        <EntityEditModal
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          title="Editar ítem de presupuesto"
          description="Modificar los datos del ítem"
          descriptor={budgetItemEditForm}
          schema={budgetItemEditFormSchema}
          defaultValues={getBudgetItemEditDefaults(editTarget)}
          onSubmit={handleEdit}
          isPending={isUpdating}
          errorMessage={updateError}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Eliminar ítem de presupuesto"
          content={
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás eliminar el ítem <strong>{deleteTarget.concept}</strong>?
            </p>
          }
          onDeleted={handleDelete}
          isDeleting={isRemoving}
        />
      )}
    </>
  )
}
