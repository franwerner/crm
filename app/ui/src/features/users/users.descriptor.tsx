import type { EntityDescriptor } from '@shared/lib/data-view'
import type { UserView } from '@shared/api/types/UserView'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

export const usersDescriptor: EntityDescriptor<UserView> = {
  name: 'users',
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
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      filterType: 'text',
      searchable: true,
      render: (value) => (
        <span className="text-muted-foreground">{value as string}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Creado',
      sortable: true,
      filterable: true,
      filterType: 'date',
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
      render: (value) => (
        <span className="text-muted-foreground">{formatDateTime(value as string)}</span>
      ),
    },
  ],
}
