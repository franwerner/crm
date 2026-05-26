import { useGetContactsKpis } from '@shared/api/hooks/useGetContactsKpis'
import { pipelineStateOptions } from '@features/contacts/constants/contacts.options'
import type { StatesStateEnumKey } from '@shared/api/types/ContactKpisResponse'
import type { ContactKpiItem, ContactKpisTotal } from '@features/contacts/types/contacts.types'

type TrendDirection = 'up' | 'down' | 'neutral'

function computeTrend(current: number, previous: number): { direction: TrendDirection; value: string } {
  const pct = previous === 0 ? (current === 0 ? 0 : 100) : Math.round(((current - previous) / previous) * 100)
  const direction: TrendDirection = pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral'
  return { direction, value: `${pct > 0 ? '+' : ''}${pct}%` }
}

export function useContactKpis() {
  const { data, isLoading, isError } = useGetContactsKpis()

  const lookup = new Map<StatesStateEnumKey, ContactKpiItem>()

  for (const item of data?.states ?? []) {
    lookup.set(item.state, {
      state: item.state,
      value: item.current,
      trend: computeTrend(item.current, item.previous),
    })
  }

  const kpis: ContactKpiItem[] = pipelineStateOptions.map((opt) => {
    const state = opt.value as StatesStateEnumKey
    return lookup.get(state) ?? { state, value: 0, trend: { direction: 'neutral', value: '+0%' } }
  })

  const total: ContactKpisTotal = data?.total
    ? { count: data.total.count, trend: computeTrend(data.total.current, data.total.previous) }
    : { count: 0, trend: { direction: 'neutral', value: '+0%' } }

  return { total, kpis, isLoading, isError }
}
