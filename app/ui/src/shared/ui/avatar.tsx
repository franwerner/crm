import { Avatar as AvatarPrimitive } from 'radix-ui'
import { cn } from '@shared/lib/utils/cn'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

const sizes = {
  sm: 'size-8 text-[length:var(--ds-font-size-xs)]',
  md: 'size-10 text-[length:var(--ds-font-size-sm)]',
} as const

type Props = {
  name: string
  src?: string | null
  size?: keyof typeof sizes
  className?: string
}

export function Avatar({ name, src, size = 'md', className }: Props) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-[var(--ds-font-weight-semibold)] text-primary-foreground',
        sizes[size],
        className,
      )}
    >
      {src && <AvatarPrimitive.Image src={src} alt={name} className="size-full object-cover" />}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center">
        {getInitials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
