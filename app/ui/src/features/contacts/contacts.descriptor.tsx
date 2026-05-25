import { Badge } from '@shared/ui/badge'
import type { BadgeProps } from '@shared/ui/badge'
import type { EntityDescriptor } from '@shared/lib/data-view'
import type { RelationResolver } from '@shared/lib/filter'
import { getUsers } from '@shared/api/clients'
import { getUsersQueryKey } from '@shared/api/hooks/useGetUsers'
import { queryClient } from '@shared/lib/query-client'
import type { ContactView, ContactViewPipelineStateEnumKey, ContactViewInterestLevelEnumKey } from '@shared/api/types/ContactView'
import type { GetUsersQueryParams } from '@shared/api/types/GetUsers'
import { pipelineStateOptions, sourceChannelOptions, interestLevelOptions } from '@features/contacts/contacts.options'

const USER_SEARCH_LIMIT = 20

async function fetchUserOptions(params: GetUsersQueryParams) {
  const data = await queryClient.fetchQuery({
    queryKey: getUsersQueryKey(params),
    queryFn: () => getUsers(params),
  })
  return data.items.map((u) => ({ value: u.id, label: u.name }))
}

const createdByRelation: RelationResolver = {
  search: (query) =>
    fetchUserOptions({
      search: query || undefined,
      pagination: { limit: USER_SEARCH_LIMIT, offset: 0 },
    }),
  resolve: (ids) =>
    ids.length === 0
      ? Promise.resolve([])
      : fetchUserOptions({
          filter: { id: { in: ids } },
          pagination: { limit: ids.length, offset: 0 },
        }),
}

const pipelineStateBadge: Record<ContactViewPipelineStateEnumKey, BadgeProps['variant']> = {
  Contact: 'neutral',
  Lead: 'info',
  Customer: 'success',
  Discarded: 'danger',
}

const interestLevelBadge: Record<ContactViewInterestLevelEnumKey, BadgeProps['variant']> = {
  Cold: 'neutral',
  Warm: 'warning',
  Hot: 'danger',
}

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

export const contactsDescriptor: EntityDescriptor<ContactView> = {
  name: 'contacts',
  selectable: true,
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
      key: 'phone',
      label: 'Teléfono',
      sortable: true,
      filterable: true,
      filterType: 'text',
      searchable: true,
      render: (value) => (
        <span className="text-muted-foreground">{(value as string | null) ?? '—'}</span>
      ),
    },
    {
      key: 'pipelineState',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: pipelineStateOptions,
      render: (value) => {
        const val = value as ContactViewPipelineStateEnumKey
        return <Badge variant={pipelineStateBadge[val]}>{val}</Badge>
      },
    },
    {
      key: 'sourceChannel',
      label: 'Canal',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: sourceChannelOptions,
      render: (value) => (
        <span className="text-muted-foreground">{(value as string | null) ?? '—'}</span>
      ),
    },
    {
      key: 'interestLevel',
      label: 'Interés',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: interestLevelOptions,
      render: (value) => {
        const val = value as ContactViewInterestLevelEnumKey | null
        if (!val) return <span className="text-muted-foreground">—</span>
        return <Badge variant={interestLevelBadge[val]}>{val}</Badge>
      },
    },
    {
      key: 'stateLocked',
      label: 'Bloqueado',
      hidden: true,
      filterable: true,
      filterType: 'boolean',
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      filterable: true,
      filterType: 'relation',
      relation: createdByRelation,
      render: (_, row) => (
        <span className="text-muted-foreground">{row.creator?.name ?? '—'}</span>
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
