import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import { Command, CommandInput, CommandItem, CommandList } from '@shared/ui/command'
import { cn } from '@shared/lib/cn'
import type { RelationOption, RelationResolver } from '@shared/lib/filter'

type Props = {
  multiple: boolean
  value: string[]
  onChange: (ids: string[]) => void
  search: RelationResolver['search']
  resolve: RelationResolver['resolve']
  className?: string
  placeholder?: string
}

const DEBOUNCE_MS = 250

export function RelationCombobox({
  multiple,
  value,
  onChange,
  search,
  resolve,
  className,
  placeholder = 'buscar…',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RelationOption[]>([])
  const [loading, setLoading] = useState(false)
  const [labels, setLabels] = useState<Record<string, string>>({})
  const requestedRef = useRef<Set<string>>(new Set())

  const valueKey = value.join('|')

  useEffect(() => {
    const missing = value.filter((id) => !requestedRef.current.has(id))
    if (missing.length === 0) return
    missing.forEach((id) => requestedRef.current.add(id))
    let active = true
    resolve(missing)
      .then((opts) => {
        if (!active) return
        setLabels((prev) => {
          const next = { ...prev }
          for (const o of opts) next[o.value] = o.label
          return next
        })
      })
      .catch(() => {
        missing.forEach((id) => requestedRef.current.delete(id))
      })
    return () => {
      active = false
    }
  }, [valueKey, resolve, value])

  useEffect(() => {
    if (!open) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    const timer = setTimeout(() => {
      search(query)
        .then((opts) => {
          if (!active) return
          setResults(opts)
          setLabels((prev) => {
            const next = { ...prev }
            for (const o of opts) next[o.value] = o.label
            return next
          })
          setLoading(false)
        })
        .catch(() => {
          if (!active) return
          setResults([])
          setLoading(false)
        })
    }, DEBOUNCE_MS)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, open, search])

  function toggle(id: string) {
    if (multiple) {
      onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
    } else {
      onChange([id])
      setOpen(false)
    }
  }

  const triggerLabel =
    value.length === 0 ? 'elegir…' : value.map((id) => labels[id] ?? id).join(', ')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={className}>
          {triggerLabel}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder={placeholder} />
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Buscando…
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </div>
            )}
            {!loading &&
              results.map((opt) => {
                const selected = value.includes(opt.value)
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => toggle(opt.value)}
                  >
                    <Check
                      className={cn('size-4', selected ? 'opacity-100' : 'opacity-0')}
                    />
                    {opt.label}
                  </CommandItem>
                )
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
