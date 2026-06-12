# react-day-picker

- **Categoría:** Estilos / Design System (date picker)
- **Versión:** ^10.0.1
- **Status:** Accepted
- **Decidido en fase:** 2c — date filters (filter-builder)
- **Fecha:** 2026-05-24

## Por qué la elegimos

Recomendada explícitamente por el handoff (`#datepicker`) y por shadcn como base de su componente Calendar. Headless con soporte nativo de modos `single` y `range`, accesible, sin CSS propio (se estila completamente con tokens). La CLI de shadcn la instala junto con el componente `Calendar`.

## Dependencias satélite

- **date-fns** (^4.3.0): requerida por react-day-picker v10 para formateo y cálculo de fechas. No traída por elección propia — es una dependencia par del picker. Se usa en `date-picker.tsx` para `format`, `startOfDay`, `endOfDay` y locale español.

## Alternativas descartadas

- **@internationalized/date + react-aria:** más pesado, orientado a Radix/Aria; fuera del ecosistema shadcn.
- **Implementación manual con `<input type="date">`:** no soporta rango ni preset shortcuts; limitado en customización visual.

## Notas

- Componente base en `src/shared/ui/calendar.tsx` (generado por shadcn CLI).
- `DatePicker` en `src/shared/ui/date-picker.tsx`: wrapper con Popover, modos `single` y `range`, presets rápidos (Hoy, Últimos 7 días, Últimos 30 días, Este mes).
- ISO dates: `single` emite `startOfDay(date).toISOString()`; `range` emite `[startOfDay(from).toISOString(), endOfDay(to).toISOString()]`.
