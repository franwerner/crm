import { createRoute, notFound } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { filterGroupsSchema } from '@shared/lib/utils/filter'
import { toSortFields } from '@shared/lib/data-view'
import { getProjectsIdQueryOptions } from '@shared/api/hooks/useGetProjectsId'
import { projectsDescriptor } from '@features/projects/components/projects.descriptor'
import { PROJECT_TABS } from '@features/projects/constants/project-detail-tabs'
import { ProjectsPage } from '../views/projects-page'
import { ProjectDetailPage } from '../views/project-detail-page'

const projectsSortDirEnum = z.enum(['asc', 'desc'])
const projectsSortFieldEnum = z.enum(
  toSortFields(projectsDescriptor) as [string, ...string[]],
)

export const projectsSearchSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  search: z.string().optional(),
  filterGroups: filterGroupsSchema,
  sortField: projectsSortFieldEnum.optional().default('createdAt'),
  sortDir: projectsSortDirEnum.optional().default('desc'),
})

export function createProjectsRoutes<TParent extends AnyRoute>(parentRoute: TParent) {
  const projectsRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/projects',
    validateSearch: projectsSearchSchema,
    staticData: { breadcrumb: [{ label: 'Proyectos' }] },
    component: ProjectsPage,
  })

  const projectDetailSearchSchema = z.object({
    tab: z.enum(PROJECT_TABS).optional().default('summary'),
  })

  const projectDetailRoute = createRoute({
    getParentRoute: () => parentRoute,
    path: '/projects/$id',
    validateSearch: projectDetailSearchSchema,
    staticData: { breadcrumb: [{ label: 'Proyectos', to: '/projects' }, { label: 'Detalle de proyecto' }] },
    loader: async ({ context, params }) => {
      try {
        await context.queryClient.ensureQueryData(getProjectsIdQueryOptions(params.id))
      } catch {
        throw notFound()
      }
    },
    notFoundComponent: () => (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <span className="text-foreground text-[length:var(--ds-font-size-md)]">Proyecto no encontrado</span>
        <span className="text-muted-foreground text-[length:var(--ds-font-size-sm)]">El proyecto solicitado no existe.</span>
      </div>
    ),
    component: ProjectDetailPage,
  })

  return [projectsRoute, projectDetailRoute] as const
}
