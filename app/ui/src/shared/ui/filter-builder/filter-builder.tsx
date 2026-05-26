import { cn } from '@shared/lib/utils/cn'
import { ConditionRow } from './condition-row'
import {
  defaultOpForField,
  type Condition,
  type FilterGroups,
  type FilterSchema,
} from '@shared/lib/utils/filter'

type Props = {
  schema: FilterSchema
  groups: FilterGroups
  onChange: (groups: FilterGroups) => void
}

function emptyCondition(schema: FilterSchema): Condition {
  const first = schema[0]!
  return { field: first.key, op: defaultOpForField(first) }
}

export function FilterBuilder({ schema, groups, onChange }: Props) {
  function addGroup() {
    onChange([...groups, [emptyCondition(schema)]])
  }

  function addCondition(groupIdx: number) {
    const next = groups.map((g, i) =>
      i === groupIdx ? [...g, emptyCondition(schema)] : g,
    )
    onChange(next)
  }

  function updateCondition(groupIdx: number, condIdx: number, cond: Condition) {
    const next = groups.map((g, i) =>
      i === groupIdx
        ? g.map((c, j) => (j === condIdx ? cond : c))
        : g,
    )
    onChange(next)
  }

  function removeCondition(groupIdx: number, condIdx: number) {
    const group = (groups[groupIdx] ?? []).filter((_, j) => j !== condIdx)
    if (group.length === 0) {
      onChange(groups.filter((_, i) => i !== groupIdx))
    } else {
      onChange(groups.map((g, i) => (i === groupIdx ? group : g)))
    }
  }

  const addBtn =
    'self-start border border-dashed border-[var(--ds-color-border-strong)] bg-transparent px-3 py-1.5 rounded-sm text-xs text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-pointer'

  return (
    <div
      className={cn(
        'rounded-[var(--ds-radius-lg)] border-[1.5px] border-[var(--ds-color-border-brand)]',
        'bg-card p-4 shadow-brutal-md flex flex-col gap-3',
      )}
    >
      {groups.map((group, gi) => (
        <div
          key={gi}
          className={cn(
            'relative bg-muted rounded-sm p-3 flex flex-col gap-2 pt-5',
          )}
        >
          <span
            className={cn(
              'absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border border-border bg-card',
              gi === 0 ? 'text-foreground' : 'bg-primary text-foreground border-primary',
            )}
          >
            {gi === 0 ? 'DONDE' : 'O'}
          </span>

          {group.map((cond, ci) => (
            <ConditionRow
              key={ci}
              schema={schema}
              condition={cond}
              onChange={(next) => updateCondition(gi, ci, next)}
              onRemove={() => removeCondition(gi, ci)}
            />
          ))}

          <button
            type="button"
            className={addBtn}
            onClick={() => addCondition(gi)}
          >
            + agregar condición
          </button>
        </div>
      ))}

      <button
        type="button"
        className={cn(addBtn, 'mt-1')}
        onClick={addGroup}
      >
        + agregar grupo (O)
      </button>
    </div>
  )
}
