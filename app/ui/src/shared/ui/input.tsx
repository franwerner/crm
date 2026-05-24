import * as React from 'react'
import { cn } from '@shared/lib/cn'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'h-10 w-full px-3 rounded-md border-[1.5px] border-brand bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
