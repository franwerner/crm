import { useGetProjectsKpis } from '@shared/api/hooks/useGetProjectsKpis'
import { projectStatusOptions } from '@features/projects/constants/projects.options'
import type { StatesStateEnum2Key } from '@shared/api/types/ProjectKpisResponse'
import type { ProjectKpiItem, ProjectKpisTotal } from '@features/projects/types/projects.types'

type TrendDirection = 'up' | 'down' | 'neutral'

function computeTrend(current: number, previous: number): { direction: TrendDirection; value: string } {
  const pct = previous === 0 ? (current === 0 ? 0 : 100) : Math.round(((current - previous) / previous) * 100)
  const direction: TrendDirection = pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral'
  return { direction, value: `${pct > 0 ? '+' : ''}${pct}%` }
}

export function useProjectKpis() {
  const { data, isLoading, isError } = useGetProjectsKpis()

  const lookup = new Map<StatesStateEnum2Key, ProjectKpiItem>()

  for (const item of data?.states ?? []) {
    lookup.set(item.state, {
      state: item.state,
      value: item.current,
      trend: computeTrend(item.current, item.previous),
    })
  }

  const kpis: ProjectKpiItem[] = projectStatusOptions.map((opt) => {
    const state = opt.value as StatesStateEnum2Key
    return lookup.get(state) ?? { state, value: 0, trend: { direction: 'neutral', value: '+0%' } }
  })

  const total: ProjectKpisTotal = data?.total
    ? { count: data.total.count, trend: computeTrend(data.total.current, data.total.previous) }
    : { count: 0, trend: { direction: 'neutral', value: '+0%' } }

  return { total, kpis, isLoading, isError }
}
