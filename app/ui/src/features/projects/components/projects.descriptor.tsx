import type { ProjectListItem, ProjectListItemStatusEnumKey } from '@shared/api/types/ProjectListItem'
import type { EntityDescriptor } from '@shared/lib/data-view'
import { contactRelation } from '@shared/lib/relations/contact.relation'
import { formatDate, formatDateTime } from '@shared/lib/utils/date'
import { Badge } from '@shared/ui/badge'
import { projectStatusBadge, projectStatusLabels, projectStatusOptions } from '../constants/projects.options'

export const projectsDescriptor: EntityDescriptor<ProjectListItem> = {
  name: 'projects',
  selectable: false,
  defaultSort: { field: 'createdAt', dir: 'desc' },
  fields: [
    {
      key: 'id',
      label: 'ID',
      hidden: true,
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      filterable: true,
      filterType: 'text',
      searchable: true,
      render: (value) => (
        <span className="font-medium text-foreground">{value as string}</span>
      ),
    },
    {
      key: 'contactName',
      label: 'Cliente',
      render: (value) => (
        <span className="text-muted-foreground">{(value as string | null) ?? '—'}</span>
      ),
    },
    {
      key: 'contactId',
      label: 'Cliente',
      hidden: true,
      filterable: true,
      filterType: 'relation',
      relation: contactRelation,
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: projectStatusOptions,
      render: (value) => {
        const val = value as ProjectListItemStatusEnumKey
        return <Badge variant={projectStatusBadge[val]}>{projectStatusLabels[val]}</Badge>
      },
    },
    {
      key: 'currency',
      label: 'Moneda',
      filterable: true,
      filterType: 'text',
      render: (value) => (
        <span className="text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: 'startDate',
      label: 'Inicio',
      sortable: true,
      filterable: true,
      filterType: 'date',
      render: (value) => (
        <span className="text-muted-foreground">{formatDate(value as string)}</span>
      ),
    },
    {
      key: 'plannedEndDate',
      label: 'Fin planificado',
      sortable: true,
      filterable: true,
      filterType: 'date',
      render: (value) => (
        <span className="text-muted-foreground">{formatDate(value as string)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Creado',
      sortable: true,
      filterable: true,
      filterType: 'date',
      hidden: true,
      render: (value) => (
        <span className="text-muted-foreground">{formatDate(value as string)}</span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Actualizado',
      sortable: true,
      filterable: true,
      filterType: 'date',
      hidden: true,
      render: (value) => (
        <span className="text-muted-foreground">{formatDateTime(value as string)}</span>
      ),
    },
  ],
}
