// eslint-disable-next-line boundaries/element-types
import { useProjectStateChanges } from '@features/projects/hooks/use-project-state-changes'
import { ProjectStateChangesPanel } from '@features/projects/components/project-detail/activity/project-state-changes-panel'

type Props = {
  projectId: string
}

export function ProjectActivityTab({ projectId }: Props) {
  const { stateChanges, isLoading } = useProjectStateChanges(projectId)

  return (
    <ProjectStateChangesPanel stateChanges={stateChanges} isLoading={isLoading} />
  )
}
