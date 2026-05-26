import * as React from 'react'
import { cn } from '@shared/lib/utils/cn'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-20 w-full px-3 py-2 rounded-md border-[1.5px] border-brand bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[var(--ds-shadow-focus)] aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[var(--ds-shadow-focus-danger)] disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
