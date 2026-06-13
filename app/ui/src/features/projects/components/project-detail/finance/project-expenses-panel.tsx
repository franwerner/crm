import { useState } from 'react'
import { PanelCard } from '@shared/ui/panel-card'
import { Button } from '@shared/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { EntityCreateModal } from '@shared/ui/entity-create-modal'
import { EntityEditModal } from '@shared/ui/entity-edit-modal'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import type { ProjectExpenseView } from '@shared/api/types/ProjectExpenseView'
import {
  expenseCreateForm,
  expenseCreateFormSchema,
  expenseCreateDefaultValues,
} from '@features/projects/constants/project-expense.form'
import type { ExpenseCreateFormValues } from '@features/projects/constants/project-expense.form'
import {
  expenseEditForm,
  expenseEditFormSchema,
  getExpenseEditDefaults,
} from '@features/projects/constants/project-expense-edit.form'
import type { ExpenseEditFormValues } from '@features/projects/constants/project-expense-edit.form'
import { formatDate } from '@shared/lib/utils/date'

type Props = {
  expenses: ProjectExpenseView[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
  currency: string
  onAdd: (data: ExpenseCreateFormValues) => Promise<void>
  onEdit: (expenseId: string, data: ExpenseEditFormValues) => Promise<void>
  onDelete: (expenseId: string) => Promise<void>
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

export function ProjectExpensesPanel({
  expenses,
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
  const [editTarget, setEditTarget] = useState<ProjectExpenseView | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProjectExpenseView | null>(null)

  async function handleAdd(data: ExpenseCreateFormValues) {
    await onAdd(data)
  }

  async function handleEdit(data: ExpenseEditFormValues) {
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
      <PanelCard
        title="Gastos"
        action={
          <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3 w-3" />
            Agregar
          </Button>
        }
      >
        {isLoading ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
          ) : expenses.length === 0 ? (
            <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
              Sin gastos registrados.
            </p>
          ) : (
            <>
              <table className="w-full text-[length:var(--ds-font-size-sm)]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-muted-foreground">Concepto</th>
                    <th className="py-2 text-center font-medium text-muted-foreground">Fecha</th>
                    <th className="py-2 text-right font-medium text-muted-foreground">Monto</th>
                    <th className="py-2 w-16" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="py-2 text-foreground">{expense.concept}</td>
                      <td className="py-2 text-center text-muted-foreground">
                        {formatDate(expense.incurredAt)}
                      </td>
                      <td className="py-2 text-right text-foreground">
                        {formatMoney(expense.amountMinor, currency)}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditTarget(expense)} aria-label="Editar gasto">
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(expense)} aria-label="Eliminar gasto">
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
      </PanelCard>

      <EntityCreateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Registrar gasto"
        description="Agregar un gasto al proyecto"
        descriptor={expenseCreateForm}
        schema={expenseCreateFormSchema}
        defaultValues={expenseCreateDefaultValues}
        onSubmit={handleAdd}
        submitLabel="Registrar"
        pendingLabel="Registrando…"
        isPending={isAdding}
        errorMessage={addError}
      />

      {editTarget && (
        <EntityEditModal
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          title="Editar gasto"
          description="Modificar los datos del gasto"
          descriptor={expenseEditForm}
          schema={expenseEditFormSchema}
          defaultValues={getExpenseEditDefaults(editTarget)}
          onSubmit={handleEdit}
          isPending={isUpdating}
          errorMessage={updateError}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
          title="Eliminar gasto"
          content={
            <p className="text-[length:var(--ds-font-size-sm)] text-foreground">
              ¿Confirmás eliminar el gasto <strong>{deleteTarget.concept}</strong>?
            </p>
          }
          onDeleted={handleDelete}
          isDeleting={isRemoving}
        />
      )}
    </>
  )
}
