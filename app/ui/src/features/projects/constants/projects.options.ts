import type { ProjectListItemStatusEnumKey } from '@shared/api/types/ProjectListItem'
import { optionsToLabelMap } from '@shared/lib/data-view'
import type { Option } from '@shared/lib/types/option'
import type { BadgeProps } from '@shared/ui/badge'

export const projectStatusOptions: Option<ProjectListItemStatusEnumKey>[] = [
  { value: 'Draft', label: 'Borrador' },
  { value: 'Active', label: 'Activo' },
  { value: 'Closed', label: 'Cerrado' },
  { value: 'Cancelled', label: 'Cancelado' },
]

export const projectStatusLabels = optionsToLabelMap(projectStatusOptions)

export const projectStatusBadge: Record<ProjectListItemStatusEnumKey, BadgeProps['variant']> = {
  Draft: 'neutral',
  Active: 'success',
  Closed: 'info',
  Cancelled: 'danger',
}
