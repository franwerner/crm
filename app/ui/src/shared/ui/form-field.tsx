import type { ReactNode } from 'react'
import { Label } from '@shared/ui/label'

type CommonProps = {
  label: string
  required?: boolean
  extra?: ReactNode
  error?: string | null
  htmlFor?: string
  children: ReactNode
}

function RequiredMark() {
  return <span className="ml-0.5 text-destructive">*</span>
}

function ExtraSlot({ value }: { value: ReactNode }) {
  if (value === null || value === undefined || value === false) return null
  if (typeof value === 'string') {
    return <div className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">{value}</div>
  }
  return <>{value}</>
}

function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <span className="text-[length:var(--ds-font-size-xs)] text-destructive">{children}</span>
  )
}

export function FormField({ label, required, extra, error, htmlFor, children }: CommonProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <RequiredMark /> : null}
      </Label>
      {children}
      <ExtraSlot value={extra} />
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </div>
  )
}

type InlineProps = CommonProps & {
  labelClassName?: string
}

export function InlineFormField({ label, required, extra, error, htmlFor, children, labelClassName }: InlineProps) {
  return (
    <div className="flex flex-col gap-1 py-1.5">
      <div className="flex items-start justify-between gap-4">
        <Label
          htmlFor={htmlFor}
          className={labelClassName ?? 'mt-0.5 shrink-0 text-[length:var(--ds-font-size-sm)] text-muted-foreground'}
        >
          {label}
          {required ? <RequiredMark /> : null}
        </Label>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <ExtraSlot value={extra} />
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </div>
  )
}
