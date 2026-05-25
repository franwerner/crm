import { useEffect, useRef, useState } from 'react'
import { Input } from '@shared/ui/input'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
}

export function ContactsSearch({ value, onChange, placeholder = 'Buscar…', debounceMs = 350 }: Props) {
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
    <Input
      type="search"
      placeholder={placeholder}
      value={draft}
      onChange={handleChange}
      className="max-w-sm"
    />
  )
}
