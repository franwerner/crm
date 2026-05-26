import { cn } from '@shared/lib/utils/cn'

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="size-8 shrink-0" />
      <span className="inline-flex items-baseline gap-1 text-lg font-bold tracking-tight text-foreground">
        Freshup
        <span className="font-mono text-sm font-medium tracking-tight">/labs</span>
      </span>
    </div>
  )
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#FAFAF7" stroke="#0A0A0A" strokeWidth="2.5" />
      <path d="M20 44 L44 20 M20 44 L48 44 M44 20 L48 44" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="44" r="9" fill="#B6F36A" stroke="#0A0A0A" strokeWidth="2.5" />
      <circle cx="44" cy="20" r="6" fill="#0A0A0A" />
      <circle cx="48" cy="44" r="4" fill="#B6F36A" stroke="#0A0A0A" strokeWidth="2" />
    </svg>
  )
}
