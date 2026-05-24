import * as React from 'react'
import { Slot as SlotPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@shared/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap h-10 px-6 rounded-full border-[1.5px] border-brand text-sm font-medium shadow-brutal-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal-md active:translate-x-0.5 active:translate-y-0.5 active:shadow-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        destructive: 'bg-destructive text-white',
        outline: 'bg-background',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
        ghost:
          'border-transparent shadow-none hover:bg-muted hover:translate-x-0 hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0',
        link: 'text-primary underline-offset-4 hover:underline border-transparent shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none active:translate-x-0 active:translate-y-0',
      },
      size: {
        default: 'h-10 px-6',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? SlotPrimitive.Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { buttonVariants }
