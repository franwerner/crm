import {
  contactTypeOptions,
  contactTypeLabels,
  sexOptions,
  interestLevelLabels,
  interestLevelOptions,
  pipelineStateLabels,
  pipelineStateOptions,
  sourceChannelLabels,
  sourceChannelOptions,
} from '@features/contacts/constants/contacts.options'
import type { ContactListItem } from '@shared/api/types/ContactListItem'
import type {
  ContactListItemContactTypeEnumKey,
  ContactListItemInterestLevelEnumKey,
  ContactListItemPipelineStateEnumKey,
  ContactListItemSexEnumKey,
  ContactListItemSourceChannelEnumKey,
  PrimaryChannelChannelTypeEnumKey,
} from '@shared/api/types/ContactListItem'
import type { EntityDescriptor } from '@shared/lib/data-view'
import { userRelation } from '@shared/lib/data-view/relations/user.relation'
import { formatDate, formatDateTime } from '@shared/lib/utils/date'
import { Avatar } from '@shared/ui/avatar'
import { Badge } from '@shared/ui/badge'
import { interestLevelBadge, pipelineStateBadge, sourceChannelBadge } from '../constants/status-color-badge.constat'

const channelTypeLabels: Record<PrimaryChannelChannelTypeEnumKey, string> = {
  Phone: 'Teléfono',
  Email: 'Email',
  WhatsApp: 'WhatsApp',
  Instagram: 'Instagram',
  Website: 'Sitio web',
  Other: 'Otro',
}

export const contactsDescriptor: EntityDescriptor<ContactListItem> = {
  name: 'contacts',
  selectable: true,
  defaultSort: { field: 'updatedAt', dir: 'desc' },
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
      key: 'contactType',
      label: 'Tipo',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: contactTypeOptions,
      render: (value) => {
        const val = value as ContactListItemContactTypeEnumKey
        return <span className="text-muted-foreground">{contactTypeLabels[val]}</span>
      },
    },
    {
      key: 'sex',
      label: 'Sexo',
      filterable: true,
      filterType: 'enum',
      options: sexOptions,
      render: (value) => {
        const val = value as ContactListItemSexEnumKey | null
        if (!val || val === 'Unspecified') return <span className="text-muted-foreground">—</span>
        const labels: Record<ContactListItemSexEnumKey, string> = {
          Male: 'Masculino',
          Female: 'Femenino',
          Other: 'Otro',
          Unspecified: '—',
        }
        return <span className="text-muted-foreground">{labels[val]}</span>
      },
    },
    {
      key: 'primaryChannel',
      label: 'Canal principal',
      render: (value) => {
        const ch = value as ContactListItem['primaryChannel']
        if (!ch) return <span className="text-muted-foreground">—</span>
        return (
          <span className="text-muted-foreground">
            {channelTypeLabels[ch.channelType]}: {ch.value}
          </span>
        )
      },
    },
    {
      key: 'pipelineState',
      label: 'Estado',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: pipelineStateOptions,
      render: (value) => {
        const val = value as ContactListItemPipelineStateEnumKey
        return <Badge variant={pipelineStateBadge[val]}>{pipelineStateLabels[val]}</Badge>
      },
    },
    {
      key: 'sourceChannel',
      label: 'Canal',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: sourceChannelOptions,
      render: (value) => {
        const val = value as ContactListItemSourceChannelEnumKey | null
        if (!val) return <span className="text-muted-foreground">—</span>
        return <Badge variant={sourceChannelBadge[val]}>{sourceChannelLabels[val]}</Badge>
      },
    },
    {
      key: 'interestLevel',
      label: 'Interés',
      sortable: true,
      filterable: true,
      filterType: 'enum',
      options: interestLevelOptions,
      render: (value) => {
        const val = value as ContactListItemInterestLevelEnumKey | null
        if (!val) return <span className="text-muted-foreground">—</span>
        return <Badge variant={interestLevelBadge[val]}>{interestLevelLabels[val]}</Badge>
      },
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      filterable: true,
      filterType: 'relation',
      relation: userRelation,
      render: (_, row) =>
        row.creator ? (
          <span className="flex items-center gap-2">
            <Avatar name={row.creator.name} size="sm" />
            <span className="text-foreground">{row.creator.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
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
