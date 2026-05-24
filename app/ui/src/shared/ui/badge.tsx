import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-3 py-0.5 rounded-full border-[1.5px] border-brand text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-background text-foreground',
        primary: 'bg-primary text-foreground',
        danger: 'bg-destructive text-white',
        info: 'bg-secondary text-secondary-foreground',
        success: 'bg-[var(--ds-color-success-50)] text-foreground',
        warning: 'bg-[var(--ds-color-warning-50)] text-foreground',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { badgeVariants }
