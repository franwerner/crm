// eslint-disable-next-line boundaries/external
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@shared/ui/tabs'
import { ProjectSummaryTab } from '@features/projects/components/project-detail/summary/project-summary-tab'
import { ProjectFinanceTab } from '@features/projects/components/project-detail/finance/project-finance-tab'
import { ProjectPeopleTab } from '@features/projects/components/project-detail/people/project-people-tab'
import { ProjectDocumentsTab } from '@features/projects/components/project-detail/documents/project-documents-tab'
import { ProjectActivityTab } from '@features/projects/components/project-detail/activity/project-activity-tab'
import { PROJECT_TABS } from '@features/projects/constants/project-detail-tabs'
import type { ProjectTab } from '@features/projects/constants/project-detail-tabs'
import type { ProjectView } from '@shared/api/types/ProjectView'

type Props = {
  project: ProjectView
}

const TAB_LABELS: Record<ProjectTab, string> = {
  summary: 'Datos',
  finance: 'Finanzas',
  people: 'Personas',
  documents: 'Documentos',
  activity: 'Actividad',
}

export function ProjectDetailTabs({ project }: Props) {
  const { tab } = useSearch({ from: '/_authenticated/projects/$id' })
  const navigate = useNavigate({ from: '/projects/$id' })

  function handleTabChange(value: string) {
    navigate({ search: (prev) => ({ ...prev, tab: value as ProjectTab }), replace: false })
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        {PROJECT_TABS.map((key) => (
          <TabsTrigger key={key} value={key}>
            {TAB_LABELS[key]}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="summary">
        <ProjectSummaryTab project={project} />
      </TabsContent>

      <TabsContent value="finance">
        <ProjectFinanceTab projectId={project.id} currency={project.currency} />
      </TabsContent>

      <TabsContent value="people">
        <ProjectPeopleTab projectId={project.id} responsibles={project.responsibles} />
      </TabsContent>

      <TabsContent value="documents">
        <ProjectDocumentsTab projectId={project.id} />
      </TabsContent>

      <TabsContent value="activity">
        <ProjectActivityTab projectId={project.id} />
      </TabsContent>
    </Tabs>
  )
}
