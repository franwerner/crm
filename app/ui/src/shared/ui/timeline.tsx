import { cn } from '@shared/lib/utils/cn'

type DotVariant = 'user' | 'system' | 'warn'

type TimelineItemProps = {
  dot?: DotVariant
  children: React.ReactNode
  className?: string
}

type TimelineProps = {
  children: React.ReactNode
  className?: string
}

function TimelineDot({ variant = 'system' }: { variant?: DotVariant }) {
  return (
    <div
      className={cn(
        'size-8 shrink-0 rounded-full border-[1.5px] grid place-items-center',
        variant === 'user' && 'bg-primary border-primary text-[var(--ds-color-text-on-primary)]',
        variant === 'warn' && 'bg-[var(--ds-color-danger-50)] border-[var(--ds-color-danger-300)] text-[var(--ds-color-danger-700)]',
        variant === 'system' && 'bg-card border-border text-muted-foreground',
      )}
    />
  )
}

export function TimelineItem({ dot = 'system', children, className }: TimelineItemProps) {
  return (
    <div className={cn('group/item relative grid gap-3 py-3', className)} style={{ gridTemplateColumns: '32px 1fr' }}>
      <div className="relative flex flex-col items-center">
        <TimelineDot variant={dot} />
        <div className="group-last/item:hidden absolute top-9 bottom-[-12px] left-1/2 w-px -translate-x-1/2 bg-border" />
      </div>
      <div>{children}</div>
    </div>
  )
}

export function TimelineContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('pt-1.5 text-[length:var(--ds-font-size-sm)]', className)}>
      {children}
    </div>
  )
}

export function TimelineMeta({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('text-[length:var(--ds-font-size-xs)] text-muted-foreground mt-0.5', className)}>
      {children}
    </div>
  )
}

export function TimelineQuote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-2 rounded-[var(--ds-radius-sm)] bg-muted px-3 py-2 text-[length:var(--ds-font-size-sm)]', className)}>
      {children}
    </div>
  )
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {children}
    </div>
  )
}
