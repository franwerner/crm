import type { UpdateProjectBody } from '@shared/api/types/UpdateProjectBody'
import type { ProjectView } from '@shared/api/types/ProjectView'

export function makeValues(project: ProjectView): Partial<UpdateProjectBody> {
  return {
    name: project.name,
    description: project.description,
    contactId: project.contactId,
    currency: project.currency,
    startDate: project.startDate,
  }
}
