import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@shared/ui/input'
import { cn } from '@shared/lib/utils/cn'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function InputSearch({ value, onChange, placeholder = 'Buscar…', debounceMs = 350, className }: Props) {
  const [draft, setDraft] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setDraft(next)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(next)
    }, debounceMs)
  }

  return (
    <div className={cn('relative max-w-3xl', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={draft}
        onChange={handleChange}
        className="pl-9"
      />
    </div>
  )
}
