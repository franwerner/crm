"use client"

import * as React from "react"
import { format, startOfDay, endOfDay } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover"
import { Calendar } from "@shared/ui/calendar"
import { cn } from "@shared/lib/utils/cn"

type SingleProps = {
  mode: "single"
  value: string | undefined
  onValueChange: (iso: string) => void
  className?: string
}

type RangeProps = {
  mode: "range"
  value: [string, string] | undefined
  onValueChange: (range: [string, string]) => void
  className?: string
}

export type DatePickerProps = SingleProps | RangeProps

function toISOStart(date: Date): string {
  return startOfDay(date).toISOString()
}

function toISOEnd(date: Date): string {
  return endOfDay(date).toISOString()
}

function formatDisplay(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: es })
}

function parseSingle(iso: string | undefined): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  return isNaN(d.getTime()) ? undefined : d
}

function parseRange(value: [string, string] | undefined): DateRange | undefined {
  if (!value) return undefined
  const from = new Date(value[0])
  const to = new Date(value[1])
  return {
    from: isNaN(from.getTime()) ? undefined : from,
    to: isNaN(to.getTime()) ? undefined : to,
  }
}

const pill =
  "inline-flex items-center gap-2 border-[1.5px] border-[var(--ds-color-border-brand)] rounded-full px-3 py-1 text-sm cursor-pointer select-none transition-colors bg-primary text-foreground font-medium"

type PresetDef = {
  label: string
  range: () => [string, string]
}

const PRESETS: PresetDef[] = [
  {
    label: "Hoy",
    range: () => {
      const now = new Date()
      return [toISOStart(now), toISOEnd(now)]
    },
  },
  {
    label: "Últimos 7 días",
    range: () => {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 6)
      return [toISOStart(start), toISOEnd(now)]
    },
  },
  {
    label: "Últimos 30 días",
    range: () => {
      const now = new Date()
      const start = new Date(now)
      start.setDate(start.getDate() - 29)
      return [toISOStart(start), toISOEnd(now)]
    },
  },
  {
    label: "Este mes",
    range: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return [toISOStart(start), toISOEnd(now)]
    },
  },
]

function SingleDatePicker({ value, onValueChange, className }: SingleProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseSingle(value)
  const label = selected ? formatDisplay(selected) : "Elegir fecha…"

  function handleSelect(day: Date | undefined) {
    if (!day) return
    onValueChange(toISOStart(day))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(pill, !value && "opacity-60", className)}
          aria-label="Elegir fecha"
        >
          <CalendarIcon className="size-3.5" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

function RangeDatePicker({ value, onValueChange, className }: RangeProps) {
  const [open, setOpen] = React.useState(false)
  const rangeValue = parseRange(value)

  const label =
    rangeValue?.from && rangeValue?.to
      ? `${formatDisplay(rangeValue.from)} – ${formatDisplay(rangeValue.to)}`
      : rangeValue?.from
        ? `${formatDisplay(rangeValue.from)} – …`
        : "elegir fecha…"

  function handleRangeSelect(range: DateRange | undefined) {
    if (!range?.from) return
    if (range.to) {
      onValueChange([toISOStart(range.from), toISOEnd(range.to)])
      setOpen(false)
    }
  }

  function handlePreset(preset: PresetDef) {
    onValueChange(preset.range())
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(pill, !value && "opacity-60", className)}
          aria-label="Elegir rango de fechas"
        >
          <CalendarIcon className="size-3.5" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex">
          <div className="flex flex-col gap-0.5 border-r border-[var(--ds-color-border)] bg-[var(--ds-color-bg-subtle)] p-2 min-w-[130px]">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handlePreset(p)}
                className="rounded-[var(--radius-xs)] px-2 py-1 text-left text-sm text-[var(--ds-color-text)] hover:bg-[var(--ds-color-surface)] transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={rangeValue}
            onSelect={handleRangeSelect}
            numberOfMonths={1}
            autoFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DatePicker(props: DatePickerProps) {
  if (props.mode === "single") {
    return <SingleDatePicker {...props} />
  }
  return <RangeDatePicker {...props} />
}
