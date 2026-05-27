# shadcn/ui

- **Categoría:** Estilos / Design System
- **Versión:** latest (CLI) / componentes vendorizados en el repo
- **Status:** Accepted
- **Decidido en fase:** folder-structure (`styling-and-design-system.md`)
- **Fecha:** 2026-05-23

## Por qué la elegimos

No es una librería cerrada: el CLI copia el código fuente de cada componente al repo, así que el custom según el handoff es total. Aporta accesibilidad de base (Radix) sin reimplementar foco/aria/tab order.

## Alternativas descartadas

- **Componentes propios desde cero:** más trabajo y la accesibilidad queda a cargo nuestro.
- **MUI / Mantine / Chakra:** librerías cerradas con theming propio; cuesta más calzar el handoff y el bundle es mayor.
- **Radix UI pelado:** shadcn ya lo envuelve con estilos estilizables; usarlo a secas duplica trabajo.

## Notas

- Alias del CLI apuntando a `src/shared/ui` (componentes en kebab-case, ver `folder-structure.md`).
- Deps satélite que arrastra (no llevan mini-ADR propio):
  - `class-variance-authority` — variants de componentes.
  - `clsx` + `tailwind-merge` — helper `cn()` para componer clases.
  - `lucide-react` — íconos (estilo lineal, coherente con el handoff).
  - `@tailwindcss/vite` — plugin de Tailwind v4 para Vite.
- Mapeo de tokens handoff → esquema shadcn: ver `styling-and-design-system.md`.
