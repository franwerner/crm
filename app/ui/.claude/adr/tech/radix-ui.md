# radix-ui

- **Categoría:** Estilos / Design System (primitivos accesibles)
- **Versión:** ^1.4.3
- **Status:** Accepted
- **Decidido en fase:** ADR 13 (base de shadcn) / convención de import 2026-05-24
- **Fecha:** 2026-05-24

## Por qué la elegimos

Es la capa de accesibilidad sobre la que se construyen los componentes de shadcn (foco, aria, tab order, navegación por teclado). Cada componente vendorizado en `src/shared/ui` depende de primitivos Radix. Se adopta el **paquete paraguas `radix-ui`** (un único paquete que reexporta todos los primitivos) en lugar de los paquetes individuales `@radix-ui/react-*`, alineado con el default del CLI actual de shadcn.

## Alternativas descartadas

- **Paquetes individuales `@radix-ui/react-*`:** una entrada por primitivo en `package.json`; conviven mal con el default del CLI moderno y duplican la convención de import. Migrados al paraguas el 2026-05-24.
- **Reimplementar accesibilidad a mano:** descartado en ADR 13 (es justo lo que aporta Radix vía shadcn).

## Notas

- Importar siempre desde `"radix-ui"`, no desde los paquetes individuales. Ej.: `import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"` → `DropdownMenuPrimitive.Root`. Los namespaces exponen `Root` (y alias como `Slot.Slot`, `Label.Label`).
- Migrados al paraguas: `button` (`Slot`) y `label`; removidos `@radix-ui/react-slot` y `@radix-ui/react-label`.
- Es satélite de shadcn (ver `shadcn.md`) pero lleva entrada propia por fijar la convención de import del proyecto.
