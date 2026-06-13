import { useState } from 'react'
// eslint-disable-next-line boundaries/element-types
import { useProjectBudgetItems } from '@features/projects/hooks/use-project-budget-items'
// eslint-disable-next-line boundaries/element-types
import { useProjectExpenses } from '@features/projects/hooks/use-project-expenses'
// eslint-disable-next-line boundaries/element-types
import { useProjectExtensions } from '@features/projects/hooks/use-project-extensions'
// eslint-disable-next-line boundaries/element-types
import { useAddBudgetItem, useUpdateBudgetItem, useRemoveBudgetItem } from '@features/projects/hooks/use-project-budget-items-mutations'
// eslint-disable-next-line boundaries/element-types
import { useAddExpense, useUpdateExpense, useRemoveExpense } from '@features/projects/hooks/use-project-expenses-mutations'
// eslint-disable-next-line boundaries/element-types
import { useAddExtension, useUpdateExtension, useRemoveExtension } from '@features/projects/hooks/use-project-extensions-mutations'
import { ProjectBudgetItemsPanel } from '@features/projects/components/project-detail/finance/project-budget-items-panel'
import { ProjectExpensesPanel } from '@features/projects/components/project-detail/finance/project-expenses-panel'
import { ProjectExtensionsPanel } from '@features/projects/components/project-detail/finance/project-extensions-panel'
import type { BudgetItemCreateFormValues } from '@features/projects/constants/project-budget-item.form'
import type { BudgetItemEditFormValues } from '@features/projects/constants/project-budget-item-edit.form'
import type { ExpenseCreateFormValues } from '@features/projects/constants/project-expense.form'
import type { ExpenseEditFormValues } from '@features/projects/constants/project-expense-edit.form'
import type { ExtensionCreateFormValues } from '@features/projects/constants/project-extension.form'
import type { ExtensionEditFormValues } from '@features/projects/constants/project-extension-edit.form'

type Props = {
  projectId: string
  currency: string
}

export function ProjectFinanceTab({ projectId, currency }: Props) {
  const [budgetPage, setBudgetPage] = useState(1)
  const [expensesPage, setExpensesPage] = useState(1)
  const [extensionsPage, setExtensionsPage] = useState(1)

  const { budgetItems, total: budgetTotal, pageSize: budgetPageSize, isLoading: isLoadingBudget } = useProjectBudgetItems(projectId, budgetPage)
  const { expenses, total: expensesTotal, pageSize: expensesPageSize, isLoading: isLoadingExpenses } = useProjectExpenses(projectId, expensesPage)
  const { extensions, total: extensionsTotal, pageSize: extensionsPageSize, isLoading: isLoadingExtensions } = useProjectExtensions(projectId, extensionsPage)

  const { addBudgetItem, isPending: isAddingBudget, errorMessage: addBudgetError } = useAddBudgetItem(projectId)
  const { updateBudgetItem, isPending: isUpdatingBudget, errorMessage: updateBudgetError } = useUpdateBudgetItem(projectId)
  const { removeBudgetItem, isPending: isRemovingBudget } = useRemoveBudgetItem(projectId)

  const { addExpense, isPending: isAddingExpense, errorMessage: addExpenseError } = useAddExpense(projectId)
  const { updateExpense, isPending: isUpdatingExpense, errorMessage: updateExpenseError } = useUpdateExpense(projectId)
  const { removeExpense, isPending: isRemovingExpense } = useRemoveExpense(projectId)

  const { addExtension, isPending: isAddingExtension, errorMessage: addExtensionError } = useAddExtension(projectId)
  const { updateExtension, isPending: isUpdatingExtension, errorMessage: updateExtensionError } = useUpdateExtension(projectId)
  const { removeExtension, isPending: isRemovingExtension } = useRemoveExtension(projectId)

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
    <div className="flex flex-col gap-6">
      <ProjectBudgetItemsPanel
        budgetItems={budgetItems}
        total={budgetTotal}
        page={budgetPage}
        pageSize={budgetPageSize}
        isLoading={isLoadingBudget}
        onPageChange={setBudgetPage}
        currency={currency}
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
        currency={currency}
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
        currency={currency}
        onAdd={handleAddExtension}
        onEdit={handleEditExtension}
        onDelete={handleDeleteExtension}
        isAdding={isAddingExtension}
        isUpdating={isUpdatingExtension}
        isRemoving={isRemovingExtension}
        addError={addExtensionError}
        updateError={updateExtensionError}
      />
    </div>
  )
}
