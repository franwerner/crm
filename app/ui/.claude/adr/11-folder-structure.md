# ADR 11 — Estructura de carpetas y naming + Atomic Design (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 5.7

## Contexto

La estructura macro quedó en el ADR 02 (features/ + shared/ + app/). Falta el naming y cómo se organiza el design-system.

## Decisión

| Qué | Convención |
|---|---|
| Archivos de componente | `PascalCase.tsx` (`CustomerTable.tsx`) |
| Hooks | `camelCase` con prefijo `use` (`useCustomers.ts`) |
| Otros archivos (utils, config, types) | `kebab-case` (`query-client.ts`, `customer.types.ts`) |
| Tipos / componentes | `PascalCase` · funciones/vars `camelCase` · constantes `UPPER_SNAKE_CASE` |
| Carpetas de feature | `features/<feature>/` (nombre del feature en minúscula) |
| `shared/ui` (design system) | **Atomic Design**: `atoms/` · `molecules/` · `organisms/` |
| Templates / pages | NO van en `shared/ui` — viven en `features/<f>/routes/` |
| Componentes de negocio | en `features/<f>/components/`, NUNCA en `shared/ui` |

## Reglas concretas

- `shared/ui` contiene SOLO componentes **agnósticos de dominio** (Button, Input, Modal). Si un componente "sabe" qué es un customer/deal, es de feature → `features/`.
- Atomic Design aplica solo al design-system reutilizable, NO a componentes de negocio.
- Un componente nuevo: ¿es agnóstico y reutilizable? → `shared/ui/{atoms|molecules|organisms}`. ¿Sabe de dominio? → `features/<f>/components/`.
- Hooks de feature en `features/<f>/hooks/` con prefijo `use`.

## Alternativas consideradas

- Todos los archivos kebab-case (consistencia con `app/api`) — no elegido; se prefirió la convención idiomática React (PascalCase para componentes).
- `shared/ui` plano sin taxonomía atómica — no elegido; se pierde la gradación del design-system.

## Consecuencias

**Positivas:** naming predecible; separación clara design-system vs negocio; idiomático React.

**Negativas / trade-offs:** convención de naming mixta (PascalCase componentes / kebab otros) — requiere disciplina (idealmente linter).

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
