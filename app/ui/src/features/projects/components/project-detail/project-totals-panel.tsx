import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
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

export function ProjectTotalsPanel({ project }: Props) {
  const { budget, expenses, profit } = project.totals
  const isNegativeProfit = profit.amountMinor < 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Totales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <div className="flex justify-between gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Presupuesto</span>
          <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">
            {formatMoney(budget.amountMinor, budget.currency)}
          </span>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Gastos</span>
          <span className="text-[length:var(--ds-font-size-sm)] text-foreground text-right">
            {formatMoney(expenses.amountMinor, expenses.currency)}
          </span>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground shrink-0">Resultado</span>
          <span
            className={`text-[length:var(--ds-font-size-sm)] text-right font-medium ${
              isNegativeProfit ? 'text-destructive' : 'text-foreground'
            }`}
          >
            {formatMoney(profit.amountMinor, profit.currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
