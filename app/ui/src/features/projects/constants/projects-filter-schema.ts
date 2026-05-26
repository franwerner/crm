import { toFilterSchema } from '@shared/lib/data-view'
import { projectsDescriptor } from '@features/projects/components/projects.descriptor'

export const projectsFilterSchema = toFilterSchema(projectsDescriptor)
