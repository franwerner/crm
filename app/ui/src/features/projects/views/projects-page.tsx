import { useMemo, useCallback } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useProjects } from '@features/projects/hooks/use-projects'
import { useCreateProject } from '@features/projects/hooks/use-project-mutations'
import { projectBaseColumns, makeProjectActionsColumn } from '@features/projects/components/projects-columns'
import { ProjectsToolbar } from '@features/projects/components/projects-toolbar'
import { projectsDescriptor } from '@features/projects/components/projects.descriptor'
import { DataTable } from '@shared/ui/data-table'
import { toSearchPresentation } from '@shared/lib/data-view'
import type { FilterGroups } from '@shared/lib/utils/filter'
import type { RowOf } from '@shared/lib/data-view'
import type { SortingState, OnChangeFn } from '@tanstack/react-table'
import type { ProjectCreateFormValues } from '@features/projects/constants/project.form'

const { placeholder: searchPlaceholder } = toSearchPresentation(projectsDescriptor)

type ProjectRow = RowOf<typeof projectsDescriptor>

export function ProjectsPage() {
  const { page, search, filterGroups, sortField, sortDir } = useSearch({ from: '/_authenticated/projects' })
  const navigate = useNavigate({ from: '/projects' })

  const goToDetail = useCallback(
    (id: string) => navigate({ to: '/projects/$id', params: { id } }),
    [navigate],
  )

  const projectColumns = useMemo(
    () => [
      ...projectBaseColumns,
      makeProjectActionsColumn({ onViewDetail: goToDetail }),
    ],
    [goToDetail],
  )

  const sorting: SortingState = [{ id: sortField, desc: sortDir === 'desc' }]

  const { rows, total, pageSize, isLoading } = useProjects({ page, search, filterGroups, sortField, sortDir })
  const { createProject, isPending: isCreating, errorMessage: createError } = useCreateProject()

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

  return (
    <DataTable
      columns={projectColumns}
      data={rows}
      loading={isLoading}
      toolbar={toolbar}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={handlePageChange}
      emptyState="No se encontraron proyectos."
      enableSorting
      sorting={sorting}
      onSortingChange={handleSortingChange}
      onRowClick={(row: ProjectRow) => goToDetail(row.id)}
    />
  )
}
