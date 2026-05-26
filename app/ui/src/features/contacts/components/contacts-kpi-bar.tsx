import { KpiCard } from '@shared/ui/kpi-card'
import { pipelineStateOptions } from '@features/contacts/constants/contacts.options'
import type { ContactKpiItem, ContactKpisTotal } from '@features/contacts/types/contacts.types'

const labelByState = Object.fromEntries(
  pipelineStateOptions.map((opt) => [opt.value, opt.label]),
) as Record<string, string>

type Props = {
  total: ContactKpisTotal
  kpis: ContactKpiItem[]
  isLoading: boolean
}

export function ContactsKpiBar({ total, kpis, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <KpiCard label="Total" value="—" />
        {pipelineStateOptions.map((opt) => (
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
