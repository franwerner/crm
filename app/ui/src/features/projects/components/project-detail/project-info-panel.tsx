import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { Badge } from '@shared/ui/badge'
import { InlineField } from '@shared/ui/inline-field'
import { toFieldDef } from '@shared/lib/form-view/types'
import type { ProjectView } from '@shared/api/types/ProjectView'
import type { UpdateProjectBody } from '@shared/api/types/UpdateProjectBody'
import { projectStatusBadge, projectStatusLabels } from '@features/projects/constants/projects.options'
import { projectEditForm } from '@features/projects/constants/project-edit.form'
import { formatDate } from '@shared/lib/utils/date'
import { makeValues } from './project-field-mappers'

const EDITABLE_KEYS: ReadonlyArray<keyof UpdateProjectBody> = [
  'name',
  'contactId',
  'currency',
  'startDate',
  'description',
]

type Props = {
  project: ProjectView
  onPatch: (partial: Partial<UpdateProjectBody>) => void
  isPending: boolean
}

export function ProjectInfoPanel({ project, onPatch, isPending }: Props) {
  const values = makeValues(project)
  const fields = projectEditForm.fields.map(toFieldDef).filter((f) => EDITABLE_KEYS.includes(f.key))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Información</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <div className="flex justify-between items-center gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Estado</span>
          <Badge variant={projectStatusBadge[project.status]}>
            {projectStatusLabels[project.status]}
          </Badge>
        </div>

        {fields.map((field) => (
          <InlineField
            key={field.key}
            field={field}
            currentValue={values[field.key]}
            onPatch={onPatch}
            isPending={isPending}
          />
        ))}

        <div className="flex justify-between gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Fin original</span>
          <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">{formatDate(project.originalPlannedEndDate)}</span>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Fin planificado</span>
          <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">{formatDate(project.plannedEndDate)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
