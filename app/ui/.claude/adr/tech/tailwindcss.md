# Tailwind CSS

- **Categoría:** Estilos / Design System
- **Versión:** v4 (latest / sin pinear)
- **Status:** Accepted
- **Decidido en fase:** folder-structure (`styling-and-design-system.md`)
- **Fecha:** 2026-05-23

## Por qué la elegimos

Utility-first estándar para SPAs React. v4 es CSS-first (tokens en `@theme`), lo que encaja directo con los design tokens del handoff que ya están en CSS custom properties. Es la base sobre la que opera shadcn/ui.

## Alternativas descartadas

- **Tailwind v3:** modelo `tailwind.config.js`; legacy frente a v4, no aprovecha tokens-en-CSS.
- **CSS Modules / vanilla CSS:** más verboso, sin el ecosistema de shadcn.
- **CSS-in-JS (styled-components / emotion):** costo en runtime, fuera de la tendencia actual.

## Notas

- Integración con Vite vía `@tailwindcss/vite` (plugin oficial de v4).
- Tokens y capa semántica puente hacia shadcn: ver `styling-and-design-system.md`.
