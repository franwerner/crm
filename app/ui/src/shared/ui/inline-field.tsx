import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Input } from '@shared/ui/input'
import { Textarea } from '@shared/ui/textarea'
import { RelationCombobox } from '@shared/ui/relation-combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'
import { Badge, type BadgeProps } from '@shared/ui/badge'
import type { Option } from '@shared/lib/types/option'
import type { RelationResolver } from '@shared/lib/utils/filter'
import type { FieldDef } from '@shared/lib/form-view/types'

function getDisplayLabel<T>(field: FieldDef<T>, raw: unknown): string {
  if (raw === null || raw === undefined || raw === '') return '—'
  const opt = field.options?.find((o) => o.value === raw)
  return opt?.label ?? String(raw)
}

type RelationDisplayProps = {
  value: string | null | undefined
  relation: RelationResolver
}

function RelationDisplay({ value, relation }: RelationDisplayProps) {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!value) {
      setLabel(null)
      return
    }
    let active = true
    relation.resolve([value]).then((opts: Option[]) => {
      if (active) setLabel(opts[0]?.label ?? value)
    }).catch(() => {
      if (active) setLabel(value)
    })
    return () => { active = false }
  }, [value, relation])

  if (!value) return <span className="text-muted-foreground">—</span>
  return <span>{label ?? value}</span>
}

type Props<T> = {
  field: FieldDef<T>
  currentValue: unknown
  onPatch: (partial: Partial<T>) => void
  isPending: boolean
}

export function InlineField<T>({ field, currentValue, onPatch, isPending }: Props<T>) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<unknown>(currentValue)

  useEffect(() => {
    if (!editing) setDraft(currentValue)
  }, [currentValue, editing])

  function startEdit() {
    setDraft(currentValue)
    setEditing(true)
  }

  function cancel() {
    setDraft(currentValue)
    setEditing(false)
  }

  function confirm(value: unknown) {
    if (value !== currentValue) {
      onPatch({ [field.key]: value === '' ? null : value } as Partial<T>)
    }
    setEditing(false)
  }

  function handleTextKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === 'Escape') cancel()
    if (e.key === 'Enter' && field.widget !== 'textarea') {
      e.preventDefault()
      confirm(draft)
    }
  }

  const displayLabel = getDisplayLabel(field, currentValue)
  const hasValue = currentValue !== null && currentValue !== undefined && currentValue !== ''
  const badgeVariant = field.badgeVariants && hasValue
    ? (field.badgeVariants[currentValue as string] as BadgeProps['variant'] | undefined)
    : undefined

  let display: ReactNode
  if (field.widget === 'relation' && field.relation) {
    display = <RelationDisplay value={currentValue as string | null | undefined} relation={field.relation} />
  } else if (badgeVariant) {
    display = <Badge variant={badgeVariant}>{displayLabel}</Badge>
  } else {
    display = displayLabel
  }

  return (
    <div className="group flex flex-col gap-1 py-1.5">
      <div className="flex items-start justify-between gap-4">
        <span className="mt-0.5 shrink-0 text-[length:var(--ds-font-size-sm)] text-muted-foreground">
          {field.label}
        </span>

        {editing ? (
          <div className="flex-1 min-w-0">
            {field.widget === 'textarea' && (
              <Textarea
                autoFocus
                value={(draft as string) ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => confirm(draft)}
                onKeyDown={(e) => { if (e.key === 'Escape') cancel() }}
                className="text-[length:var(--ds-font-size-sm)] min-h-[60px]"
                disabled={isPending}
              />
            )}
            {(field.widget === 'text' || field.widget === 'number') && (
              <Input
                autoFocus
                value={(draft as string) ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => confirm(draft)}
                onKeyDown={handleTextKeyDown}
                className="h-8 text-[length:var(--ds-font-size-sm)]"
                disabled={isPending}
              />
            )}
            {field.widget === 'select' && (
              <Select
                defaultOpen
                value={(draft as string) ?? ''}
                onValueChange={(v) => confirm(v)}
                onOpenChange={(open) => { if (!open) setEditing(false) }}
              >
                <SelectTrigger size="sm" className="w-full h-8 text-[length:var(--ds-font-size-sm)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {field.widget === 'date' && (
              <Input
                autoFocus
                type="date"
                value={(draft as string)?.slice(0, 10) ?? ''}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => confirm(draft)}
                onKeyDown={handleTextKeyDown}
                className="h-8 text-[length:var(--ds-font-size-sm)]"
                disabled={isPending}
              />
            )}
            {field.widget === 'relation' && field.relation && (
              <RelationCombobox
                multiple={false}
                defaultOpen
                value={draft ? [draft as string] : []}
                onChange={(ids) => confirm(ids[0] ?? null)}
                onOpenChange={(open) => { if (!open) setEditing(false) }}
                search={field.relation.search}
                resolve={field.relation.resolve}
                placeholder={field.placeholder}
                className="flex h-8 w-full items-center rounded-md border border-input bg-transparent px-3 text-[length:var(--ds-font-size-sm)] text-left"
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            disabled={isPending}
            className="flex-1 min-w-0 truncate cursor-text text-right text-[length:var(--ds-font-size-sm)] text-foreground hover:text-primary focus-visible:outline-none focus-visible:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {display}
          </button>
        )}
      </div>

      {editing && typeof field.extra === 'string' && (
        <div className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
          {field.extra}
        </div>
      )}
    </div>
  )
}
