import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@shared/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import { Switch } from '@shared/ui/switch'
import { Input } from '@shared/ui/input'
import { DatePicker } from '@shared/ui/date-picker'
import { cn } from '@shared/lib/cn'
import {
  OPERATOR_LABELS,
  defaultOpForField,
  isArrayOp,
  isNullOp,
  isRangeOp,
  opsForField,
  type Condition,
  type FieldDescriptor,
  type FilterSchema,
  type Operator,
} from '@shared/lib/filter'

type Props = {
  schema: FilterSchema
  condition: Condition
  onChange: (next: Condition) => void
  onRemove: () => void
}

export function ConditionRow({ schema, condition, onChange, onRemove }: Props) {
  const descriptor = schema.find((f) => f.key === condition.field) ?? schema[0]!
  const fieldOps = opsForField(descriptor)

  function handleFieldChange(field: string) {
    const next = schema.find((f) => f.key === field) ?? schema[0]!
    onChange({ field, op: defaultOpForField(next) })
  }

  function handleOpChange(op: string) {
    const next = op as Operator
    const wasArray = isArrayOp(condition.op)
    const willBeArray = isArrayOp(next)
    const willBeNull = isNullOp(next)
    const wasRange = isRangeOp(condition.op)
    const willBeRange = isRangeOp(next)

    if (willBeNull) {
      onChange({ ...condition, op: next, value: undefined })
    } else if (wasArray !== willBeArray || wasRange !== willBeRange) {
      onChange({ ...condition, op: next, value: undefined })
    } else {
      onChange({ ...condition, op: next })
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...condition, value: e.target.value })
  }

  function handleChipInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const raw = (e.currentTarget.value ?? '').trim()
      if (!raw) return
      const current = Array.isArray(condition.value) ? condition.value : []
      onChange({ ...condition, value: [...current, raw] })
      e.currentTarget.value = ''
    }
  }

  function removeChip(idx: number) {
    const current = Array.isArray(condition.value) ? condition.value : []
    onChange({ ...condition, value: current.filter((_, i) => i !== idx) })
  }

  function handleSingleEnumChange(val: string) {
    onChange({ ...condition, value: val })
  }

  function toggleMultiEnum(val: string) {
    const current = Array.isArray(condition.value) ? condition.value : []
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val]
    onChange({ ...condition, value: next })
  }

  function handleBooleanChange(checked: boolean) {
    onChange({ ...condition, value: checked ? 'true' : 'false' })
  }

  const pillBase =
    'inline-flex items-center border-[1.5px] border-[var(--ds-color-border-brand)] rounded-full px-3 py-1 text-sm cursor-pointer select-none transition-colors'
  const fieldPill = cn(pillBase, 'bg-foreground text-background font-medium')
  const opPill = cn(pillBase, 'bg-background text-foreground')
  const valuePill = cn(pillBase, 'bg-primary text-foreground font-medium')

  const showValue = !isNullOp(condition.op)
  const isArray = isArrayOp(condition.op)
  const isRange = isRangeOp(condition.op)
  const currentArrayValues = Array.isArray(condition.value) ? condition.value : []

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Select value={condition.field} onValueChange={handleFieldChange}>
        <SelectTrigger size="sm" className={fieldPill}>
          {descriptor.label}
        </SelectTrigger>
        <SelectContent align="start">
          {schema.map((f: FieldDescriptor) => (
            <SelectItem key={f.key} value={f.key}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={condition.op} onValueChange={handleOpChange}>
        <SelectTrigger size="sm" className={opPill}>
          {OPERATOR_LABELS[condition.op]}
        </SelectTrigger>
        <SelectContent align="start">
          {fieldOps.map((op) => (
            <SelectItem key={op} value={op}>
              {OPERATOR_LABELS[op]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showValue && descriptor.type === 'text' && !isArray && (
        <Input
          className="h-8 w-40 rounded-full px-3 text-sm"
          value={typeof condition.value === 'string' ? condition.value : ''}
          onChange={handleTextChange}
          placeholder="valor…"
        />
      )}

      {showValue && descriptor.type === 'text' && isArray && (
        <div className="flex flex-wrap items-center gap-1">
          {currentArrayValues.map((v, i) => (
            <span key={i} className={cn(valuePill, 'gap-1')}>
              {v}
              <button
                type="button"
                onClick={() => removeChip(i)}
                className="opacity-60 hover:opacity-100"
                aria-label={`Quitar ${v}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          <Input
            className="h-8 w-28 rounded-full px-3 text-sm"
            placeholder="valor + Enter"
            onKeyDown={handleChipInput}
          />
        </div>
      )}

      {showValue && descriptor.type === 'enum' && !isArray && (
        <Select
          value={typeof condition.value === 'string' ? condition.value : ''}
          onValueChange={handleSingleEnumChange}
        >
          <SelectTrigger size="sm" className={valuePill}>
            {typeof condition.value === 'string'
              ? (descriptor.options?.find((e) => e.value === condition.value)?.label ?? condition.value)
              : 'elegir…'}
          </SelectTrigger>
          <SelectContent align="start">
            {descriptor.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showValue && descriptor.type === 'enum' && isArray && (
        <Popover>
          <PopoverTrigger asChild>
            <button className={valuePill}>
              {currentArrayValues.length === 0
                ? 'elegir…'
                : currentArrayValues
                    .map(
                      (v) =>
                        descriptor.options?.find((e) => e.value === v)?.label ?? v,
                    )
                    .join(', ')}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-2">
            <div className="flex flex-col gap-1">
              {descriptor.options?.map((opt) => {
                const checked = currentArrayValues.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMultiEnum(opt.value)}
                    className={cn(
                      'flex items-center justify-between rounded-sm px-2 py-1.5 text-sm text-left transition-colors hover:bg-accent',
                      checked && 'font-medium',
                    )}
                  >
                    {opt.label}
                    {checked && <X className="size-3 opacity-60" />}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {showValue && descriptor.type === 'boolean' && (
        <div className="flex items-center gap-2">
          <Switch
            checked={condition.value === 'true'}
            onCheckedChange={handleBooleanChange}
            size="sm"
          />
          <span className={cn(valuePill, 'cursor-default')}>
            {condition.value === 'true' ? 'Sí' : 'No'}
          </span>
        </div>
      )}

      {showValue && descriptor.type === 'date' && isRange && (
        <DatePicker
          mode="range"
          value={
            Array.isArray(condition.value) && condition.value.length === 2
              ? (condition.value as [string, string])
              : undefined
          }
          onValueChange={(range) => onChange({ ...condition, value: range })}
        />
      )}

      {showValue && descriptor.type === 'date' && !isRange && (
        <DatePicker
          mode="single"
          value={typeof condition.value === 'string' ? condition.value : undefined}
          onValueChange={(iso) => onChange({ ...condition, value: iso })}
        />
      )}

      <button
        type="button"
        onClick={onRemove}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Eliminar condición"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
