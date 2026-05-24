import * as React from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '@shared/lib/cn'

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'inline-grid size-[18px] shrink-0 place-content-center',
        'rounded-[var(--ds-radius-xs)] border-[1.5px] border-[var(--ds-color-border-brand)]',
        'bg-background cursor-pointer transition-colors',
        'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
        'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-primary-foreground"
      >
        <svg
          viewBox="0 0 18 18"
          className="size-[18px] [[data-state=indeterminate]_&]:hidden"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 9.5L7.5 13L14 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          viewBox="0 0 18 18"
          className="size-[18px] hidden [[data-state=indeterminate]_&]:block"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.5 9H13.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
