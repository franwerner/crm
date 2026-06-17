import { useMemo, useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useProjects } from '@features/projects/hooks/use-projects'
import { useProjectKpis } from '@features/projects/hooks/use-project-kpis'
import { useCreateProject, useBulkDeleteProjects } from '@features/projects/hooks/use-project-mutations'
import { projectBaseColumns, makeProjectActionsColumn } from '@features/projects/components/projects-columns'
import { ProjectsKpiBar } from '@features/projects/components/projects-kpi-bar'
import { ProjectsToolbar } from '@features/projects/components/projects-toolbar'
import { ProjectsBulkbar } from '@features/projects/components/projects-bulkbar'
import { projectsDescriptor } from '@features/projects/components/projects.descriptor'
import { DataTable } from '@shared/ui/data-table'
import { DeleteDialog } from '@shared/ui/delete-dialog'
import { toSearchPresentation } from '@shared/lib/data-view'
import { useRowSelection } from '@shared/lib/hooks/use-row-selection'
import type { FilterGroups } from '@shared/lib/utils/filter'
import type { RowOf } from '@shared/lib/data-view'
import type { SortingState, OnChangeFn } from '@tanstack/react-table'
import type { ProjectCreateFormValues } from '@features/projects/constants/project.form'

const { placeholder: searchPlaceholder } = toSearchPresentation(projectsDescriptor)

type ProjectRow = RowOf<typeof projectsDescriptor>

export function ProjectsPage() {
  const { page, search, filterGroups, sortField, sortDir } = useSearch({ from: '/_authenticated/projects' })
  const navigate = useNavigate({ from: '/projects' })

  const { rowSelection, setRowSelection, selectedIds, clearSelection } = useRowSelection()
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const goToDetail = useCallback(
    (id: string) => navigate({ to: '/projects/$id', params: { id } }),
    [navigate],
  )

  const projectColumns = useMemo(
    () => [
      ...projectBaseColumns,
      makeProjectActionsColumn({
        onViewDetail: goToDetail,
        onDelete: (id) => setDeleteTargetId(id),
      }),
    ],
    [goToDetail],
  )

  const sorting: SortingState = [{ id: sortField, desc: sortDir === 'desc' }]

  const { rows, total, pageSize, isLoading } = useProjects({ page, search, filterGroups, sortField, sortDir })
  const { total: kpisTotal, kpis, isLoading: isLoadingKpis } = useProjectKpis()
  const { createProject, isPending: isCreating, errorMessage: createError } = useCreateProject()
  const { bulkDelete, isPending: isDeleting } = useBulkDeleteProjects()

  function handlePageChange(next: number) {
    navigate({ search: (prev) => ({ ...prev, page: next }) })
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sorting) : updater
    const first = next[0]
    navigate({
      search: (prev) => ({
        ...prev,
        sortField: first ? (first.id as typeof sortField) : undefined,
        sortDir: first ? (first.desc ? 'desc' : 'asc') : undefined,
        page: 1,
      }),
    })
  }

  function handleSearchChange(value: string) {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        page: 1,
      }),
    })
  }

  function handleApplyFilters(groups: FilterGroups) {
    navigate({
      search: (prev) => ({
        ...prev,
        filterGroups: groups.length > 0 ? groups : undefined,
        page: 1,
      }),
    })
  }

  async function handleCreateProject(data: ProjectCreateFormValues) {
    await createProject(data)
  }

  async function handleBulkDelete() {
    try {
      await bulkDelete(selectedIds)
    } catch {
      toast.error('Error al eliminar los proyectos')
    } finally {
      clearSelection()
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    try {
      await bulkDelete([deleteTargetId])
    } catch {
      toast.error('Error al eliminar el proyecto')
    } finally {
      setDeleteTargetId(null)
    }
  }

  const toolbar = (
    <ProjectsToolbar
      search={search ?? ''}
      onSearchChange={handleSearchChange}
      searchPlaceholder={searchPlaceholder}
      committedGroups={filterGroups ?? []}
      onApplyFilters={handleApplyFilters}
      onCreateProject={handleCreateProject}
      isCreating={isCreating}
      createError={createError}
    />
  )

  const bulkbar = (
    <ProjectsBulkbar
      count={selectedIds.length}
      onDelete={handleBulkDelete}
      isDeleting={isDeleting}
    />
  )

  return (
    <div className="flex flex-col gap-8">
      <ProjectsKpiBar total={kpisTotal} kpis={kpis} isLoading={isLoadingKpis} />

      <DataTable
        columns={projectColumns}
        data={rows}
        loading={isLoading}
        toolbar={toolbar}
        bulkbar={bulkbar}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        emptyState="No se encontraron proyectos."
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id}
        enableSorting
        sorting={sorting}
        onSortingChange={handleSortingChange}
        onRowClick={(row: ProjectRow) => goToDetail(row.id)}
      />

      <DeleteDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        title="Eliminar proyecto"
        content="¿Eliminar este proyecto? Esta acción no se puede deshacer."
        onDeleted={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
