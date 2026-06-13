import { KpiCard } from '@shared/ui/kpi-card'
import { projectStatusLabels } from '@features/projects/constants/projects.options'
import type { ProjectView } from '@shared/api/types/ProjectView'

type Props = {
  project: ProjectView
}

function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100)
}

export function ProjectSummaryBar({ project }: Props) {
  const { budget, expenses, profit } = project.totals
  const isNegativeProfit = profit.amountMinor < 0

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <KpiCard
        label="Presupuesto"
        value={formatMoney(budget.amountMinor, budget.currency)}
      />
      <KpiCard
        label="Gastos"
        value={formatMoney(expenses.amountMinor, expenses.currency)}
      />
      <KpiCard
        label="Resultado"
        value={formatMoney(profit.amountMinor, profit.currency)}
        className={isNegativeProfit ? 'text-destructive' : undefined}
      />
    </div>
  )
}
