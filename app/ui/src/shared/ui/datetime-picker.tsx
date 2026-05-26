"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/popover"
import { Calendar } from "@shared/ui/calendar"
import { Input } from "@shared/ui/input"
import { Button } from "@shared/ui/button"
import { cn } from "@shared/lib/utils/cn"

type Props = {
  value: string | undefined
  onValueChange: (iso: string) => void
  className?: string
}

const pill =
  "inline-flex items-center gap-2 border-[1.5px] border-[var(--ds-color-border-brand)] rounded-full px-3 py-1 text-sm cursor-pointer select-none transition-colors bg-primary text-foreground font-medium"

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

function parseValue(iso: string | undefined): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso)
  return isNaN(d.getTime()) ? undefined : d
}

function formatDisplay(d: Date): string {
  return `${format(d, "dd/MM/yyyy", { locale: es })} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function clamp(value: string, max: number): string {
  const n = Number(value) || 0
  return pad(Math.max(0, Math.min(max, n)))
}

function sanitize(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2)
}

export function DateTimePicker({ value, onValueChange, className }: Props) {
  const [open, setOpen] = React.useState(false)
  const [draftDate, setDraftDate] = React.useState<Date | undefined>()
  const [draftHour, setDraftHour] = React.useState<string>("00")
  const [draftMinute, setDraftMinute] = React.useState<string>("00")

  const current = parseValue(value)
  const label = current ? formatDisplay(current) : "elegir fecha y hora…"

  function handleOpenChange(next: boolean) {
    if (next && !open) {
      const c = parseValue(value)
      setDraftDate(c)
      setDraftHour(c ? pad(c.getHours()) : "00")
      setDraftMinute(c ? pad(c.getMinutes()) : "00")
    }
    setOpen(next)
  }

  function handleApply() {
    if (!draftDate) return
    const h = Math.max(0, Math.min(23, Number(draftHour) || 0))
    const m = Math.max(0, Math.min(59, Number(draftMinute) || 0))
    const combined = new Date(draftDate)
    combined.setHours(h, m, 0, 0)
    onValueChange(combined.toISOString())
    setOpen(false)
  }

  const timeInput =
    "h-9 w-12 px-2 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(pill, !value && "opacity-60", className)}
          aria-label="Elegir fecha y hora"
        >
          <CalendarIcon className="size-3.5" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={draftDate}
          onSelect={setDraftDate}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t border-[var(--ds-color-border)] p-3">
          <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">Hora</span>
          <div className="flex items-center gap-1">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={draftHour}
              onChange={(e) => setDraftHour(sanitize(e.target.value))}
              onBlur={() => setDraftHour(clamp(draftHour, 23))}
              aria-label="Horas"
              className={timeInput}
            />
            <span className="text-muted-foreground">:</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              value={draftMinute}
              onChange={(e) => setDraftMinute(sanitize(e.target.value))}
              onBlur={() => setDraftMinute(clamp(draftMinute, 59))}
              aria-label="Minutos"
              className={timeInput}
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={!draftDate}
            className="ml-auto"
          >
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
