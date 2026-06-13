import { PanelCard } from '@shared/ui/panel-card'
import { InlineField } from '@shared/ui/inline-field'
import { toFieldDef } from '@shared/lib/form-view/types'
import type { ProjectView } from '@shared/api/types/ProjectView'
import type { UpdateProjectBody } from '@shared/api/types/UpdateProjectBody'
import { projectEditForm } from '@features/projects/constants/project-edit.form'
import { formatDate } from '@shared/lib/utils/date'

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
  const fields = projectEditForm.fields.map(toFieldDef).filter((f) => EDITABLE_KEYS.includes(f.key))

  return (
    <PanelCard title="Información" contentClassName="flex flex-col divide-y divide-border">


      {fields.map((field) => (
        <InlineField
          key={field.key}
          field={field}
          currentValue={project[field.key]}
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
    </PanelCard>
  )
}
