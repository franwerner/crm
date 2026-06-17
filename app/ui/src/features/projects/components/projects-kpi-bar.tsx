import { KpiCard } from '@shared/ui/kpi-card'
import { projectStatusOptions } from '@features/projects/constants/projects.options'
import type { ProjectKpiItem, ProjectKpisTotal } from '@features/projects/types/projects.types'

const labelByState = Object.fromEntries(
  projectStatusOptions.map((opt) => [opt.value, opt.label]),
) as Record<string, string>

type Props = {
  total: ProjectKpisTotal
  kpis: ProjectKpiItem[]
  isLoading: boolean
}

export function ProjectsKpiBar({ total, kpis, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Total" value="—" />
        {projectStatusOptions.map((opt) => (
          <KpiCard key={opt.value} label={opt.label} value="—" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <KpiCard label="Total" value={total.count} trend={total.trend} />
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.state}
          label={labelByState[kpi.state] ?? kpi.state}
          value={kpi.value}
          trend={kpi.trend}
        />
      ))}
    </div>
  )
}
