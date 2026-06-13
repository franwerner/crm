import * as React from 'react'
import { cn } from '@shared/lib/utils/cn'

interface KpiCardProps {
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
  }
  className?: string
}

const trendClasses: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-[var(--ds-color-success-700)]',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
}

const trendSign: Record<'up' | 'down' | 'neutral', string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

export function KpiCard({ label, value, trend, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border-[1.5px] border-brand bg-card p-5 shadow-brutal-md',
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
          {value}
        </span>
        {trend && (
          <span className={cn('text-sm font-medium', trendClasses[trend.direction])}>
            {trendSign[trend.direction]} {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
