# cmdk

- **Categoría:** Estilos / Design System (combobox con búsqueda)
- **Versión:** ^1.1.1
- **Status:** Accepted
- **Decidido en fase:** filtro `relation` (filter-builder)
- **Fecha:** 2026-05-24

## Por qué la elegimos

Base estándar de shadcn para el componente `Command` (combobox/command palette con búsqueda y navegación por teclado, accesible). El filtro `relation` necesita un selector con barra de búsqueda que liste opciones remotas; `cmdk` aporta el input, la lista filtrable y la a11y sin CSS propio (se estila con tokens). Se usa con `shouldFilter={false}` porque la búsqueda es asíncrona/server-side: las opciones las provee el resolver del descriptor, no el filtrado interno de cmdk.

## Alternativas descartadas

- **Combobox manual sobre Popover + Input:** reimplementar navegación por teclado, foco y aria a mano; más código y riesgo de a11y.
- **Radix sin cmdk:** Radix no tiene primitivo de command/combobox; habría que construirlo igual.

## Notas

- Componente base en `src/shared/ui/command.tsx` (wrapper shadcn de cmdk).
- `RelationCombobox` en `src/shared/ui/relation-combobox.tsx`: combobox async (Popover + Command) para el filtro `relation`; recibe `search`/`resolve` por props (puro, sin dominio).
