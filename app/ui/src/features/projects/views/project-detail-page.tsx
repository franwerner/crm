import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useProject } from '@features/projects/hooks/use-project'
import { useProjectStateChanges } from '@features/projects/hooks/use-project-state-changes'
import { useProjectBudgetItems } from '@features/projects/hooks/use-project-budget-items'
import { useProjectExpenses } from '@features/projects/hooks/use-project-expenses'
import { useProjectExtensions } from '@features/projects/hooks/use-project-extensions'
import { useProjectDocuments } from '@features/projects/hooks/use-project-documents'
import { useUpdateProject } from '@features/projects/hooks/use-project-mutations'
import { useAddResponsible, useUpdateResponsible, useRemoveResponsible } from '@features/projects/hooks/use-project-responsibles-mutations'
import { useAddBudgetItem, useUpdateBudgetItem, useRemoveBudgetItem } from '@features/projects/hooks/use-project-budget-items-mutations'
import { useAddExpense, useUpdateExpense, useRemoveExpense } from '@features/projects/hooks/use-project-expenses-mutations'
import { useAddExtension, useUpdateExtension, useRemoveExtension } from '@features/projects/hooks/use-project-extensions-mutations'
import { ProjectDetailHeader } from '@features/projects/components/project-detail/project-detail-header'
import { ProjectInfoPanel } from '@features/projects/components/project-detail/project-info-panel'
import { ProjectTotalsPanel } from '@features/projects/components/project-detail/project-totals-panel'
import { ProjectResponsiblesPanel } from '@features/projects/components/project-detail/project-responsibles-panel'
import { ProjectStateChangesPanel } from '@features/projects/components/project-detail/project-state-changes-panel'
import { ProjectBudgetItemsPanel } from '@features/projects/components/project-detail/project-budget-items-panel'
import { ProjectExpensesPanel } from '@features/projects/components/project-detail/project-expenses-panel'
import { ProjectExtensionsPanel } from '@features/projects/components/project-detail/project-extensions-panel'
import { ProjectDocumentsPanel } from '@features/projects/components/project-detail/project-documents-panel'
import type { ResponsibleCreateFormValues } from '@features/projects/constants/project-responsible.form'
import type { ResponsibleEditFormValues } from '@features/projects/constants/project-responsible-edit.form'
import type { BudgetItemCreateFormValues } from '@features/projects/constants/project-budget-item.form'
import type { BudgetItemEditFormValues } from '@features/projects/constants/project-budget-item-edit.form'
import type { ExpenseCreateFormValues } from '@features/projects/constants/project-expense.form'
import type { ExpenseEditFormValues } from '@features/projects/constants/project-expense-edit.form'
import type { ExtensionCreateFormValues } from '@features/projects/constants/project-extension.form'
import type { ExtensionEditFormValues } from '@features/projects/constants/project-extension-edit.form'

export function ProjectDetailPage() {
  const { id } = useParams({ from: '/_authenticated/projects/$id' })

  const [budgetPage, setBudgetPage] = useState(1)
  const [expensesPage, setExpensesPage] = useState(1)
  const [extensionsPage, setExtensionsPage] = useState(1)
  const [documentsPage, setDocumentsPage] = useState(1)

  const { project, isLoading } = useProject(id)
  const { updateProject, isPending: isUpdating, errorMessage: updateError } = useUpdateProject(id)
  const { stateChanges, isLoading: isLoadingStateChanges } = useProjectStateChanges(id)
  const { budgetItems, total: budgetTotal, pageSize: budgetPageSize, isLoading: isLoadingBudget } = useProjectBudgetItems(id, budgetPage)
  const { expenses, total: expensesTotal, pageSize: expensesPageSize, isLoading: isLoadingExpenses } = useProjectExpenses(id, expensesPage)
  const { extensions, total: extensionsTotal, pageSize: extensionsPageSize, isLoading: isLoadingExtensions } = useProjectExtensions(id, extensionsPage)
  const { documents, total: documentsTotal, pageSize: documentsPageSize, isLoading: isLoadingDocuments } = useProjectDocuments(id, documentsPage)

  const { addResponsible, isPending: isAddingResponsible, errorMessage: addResponsibleError } = useAddResponsible(id)
  const { updateResponsible, isPending: isUpdatingResponsible, errorMessage: updateResponsibleError } = useUpdateResponsible(id)
  const { removeResponsible, isPending: isRemovingResponsible } = useRemoveResponsible(id)

  const { addBudgetItem, isPending: isAddingBudget, errorMessage: addBudgetError } = useAddBudgetItem(id)
  const { updateBudgetItem, isPending: isUpdatingBudget, errorMessage: updateBudgetError } = useUpdateBudgetItem(id)
  const { removeBudgetItem, isPending: isRemovingBudget } = useRemoveBudgetItem(id)

  const { addExpense, isPending: isAddingExpense, errorMessage: addExpenseError } = useAddExpense(id)
  const { updateExpense, isPending: isUpdatingExpense, errorMessage: updateExpenseError } = useUpdateExpense(id)
  const { removeExpense, isPending: isRemovingExpense } = useRemoveExpense(id)

  const { addExtension, isPending: isAddingExtension, errorMessage: addExtensionError } = useAddExtension(id)
  const { updateExtension, isPending: isUpdatingExtension, errorMessage: updateExtensionError } = useUpdateExtension(id)
  const { removeExtension, isPending: isRemovingExtension } = useRemoveExtension(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-muted-foreground text-[length:var(--ds-font-size-sm)]">Cargando…</span>
      </div>
    )
  }

  if (!project) {
    return null
  }

  async function handleAddResponsible(data: ResponsibleCreateFormValues) {
    await addResponsible(data)
  }

  async function handleEditResponsible(userId: string, data: ResponsibleEditFormValues) {
    await updateResponsible(userId, data)
  }

  async function handleDeleteResponsible(userId: string) {
    await removeResponsible(userId)
  }

  async function handleAddBudgetItem(data: BudgetItemCreateFormValues) {
    await addBudgetItem(data)
  }

  async function handleEditBudgetItem(itemId: string, data: BudgetItemEditFormValues) {
    await updateBudgetItem(itemId, data)
  }

  async function handleDeleteBudgetItem(itemId: string) {
    await removeBudgetItem(itemId)
  }

  async function handleAddExpense(data: ExpenseCreateFormValues) {
    await addExpense(data)
  }

  async function handleEditExpense(expenseId: string, data: ExpenseEditFormValues) {
    await updateExpense(expenseId, data)
  }

  async function handleDeleteExpense(expenseId: string) {
    await removeExpense(expenseId)
  }

  async function handleAddExtension(data: ExtensionCreateFormValues) {
    await addExtension(data)
  }

  async function handleEditExtension(extId: string, data: ExtensionEditFormValues) {
    await updateExtension(extId, data)
  }

  async function handleDeleteExtension(extId: string) {
    await removeExtension(extId)
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <ProjectDetailHeader project={project} />

        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <ProjectInfoPanel
              project={project}
              onPatch={updateProject}
              isPending={isUpdating}
            />
            <ProjectTotalsPanel project={project} />
            <ProjectResponsiblesPanel
              responsibles={project.responsibles}
              onAdd={handleAddResponsible}
              onEdit={handleEditResponsible}
              onDelete={handleDeleteResponsible}
              isAdding={isAddingResponsible}
              isUpdating={isUpdatingResponsible}
              isRemoving={isRemovingResponsible}
              addError={addResponsibleError}
              updateError={updateResponsibleError}
            />
            <ProjectStateChangesPanel stateChanges={stateChanges} isLoading={isLoadingStateChanges} />
          </div>

          <div className="flex flex-col gap-6">
            <ProjectBudgetItemsPanel
              budgetItems={budgetItems}
              total={budgetTotal}
              page={budgetPage}
              pageSize={budgetPageSize}
              isLoading={isLoadingBudget}
              onPageChange={setBudgetPage}
              currency={project.currency}
              onAdd={handleAddBudgetItem}
              onEdit={handleEditBudgetItem}
              onDelete={handleDeleteBudgetItem}
              isAdding={isAddingBudget}
              isUpdating={isUpdatingBudget}
              isRemoving={isRemovingBudget}
              addError={addBudgetError}
              updateError={updateBudgetError}
            />
            <ProjectExpensesPanel
              expenses={expenses}
              total={expensesTotal}
              page={expensesPage}
              pageSize={expensesPageSize}
              isLoading={isLoadingExpenses}
              onPageChange={setExpensesPage}
              currency={project.currency}
              onAdd={handleAddExpense}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              isAdding={isAddingExpense}
              isUpdating={isUpdatingExpense}
              isRemoving={isRemovingExpense}
              addError={addExpenseError}
              updateError={updateExpenseError}
            />
            <ProjectExtensionsPanel
              extensions={extensions}
              total={extensionsTotal}
              page={extensionsPage}
              pageSize={extensionsPageSize}
              isLoading={isLoadingExtensions}
              onPageChange={setExtensionsPage}
              currency={project.currency}
              onAdd={handleAddExtension}
              onEdit={handleEditExtension}
              onDelete={handleDeleteExtension}
              isAdding={isAddingExtension}
              isUpdating={isUpdatingExtension}
              isRemoving={isRemovingExtension}
              addError={addExtensionError}
              updateError={updateExtensionError}
            />
            <ProjectDocumentsPanel
              documents={documents}
              total={documentsTotal}
              page={documentsPage}
              pageSize={documentsPageSize}
              isLoading={isLoadingDocuments}
              onPageChange={setDocumentsPage}
            />
          </div>
        </div>
      </div>

      {updateError && (
        <p className="text-[length:var(--ds-font-size-sm)] text-destructive">{updateError}</p>
      )}
    </>
  )
}
