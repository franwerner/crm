# CRM Design System — Handoff for Claude Code

This folder is the **machine-readable** version of the design system, optimized for an agent (Claude Code) to port into React components.

## Files

| File | Purpose |
|---|---|
| `tokens.css` | All design tokens as CSS custom properties. Source of truth. |
| `components-reference.html` | Every component, in production styling, with semantic markup. |
| `README.md` | This file. |

## How to use this with Claude Code

Paste the following prompt to the agent, with these three files attached:

```
Estos archivos son el design system del proyecto.

1. `tokens.css` — leelo y portalo a CSS variables del proyecto
   (mantené los nombres tal cual o adaptalos a tu stack:
   Tailwind theme, shadcn/ui tokens, CSS modules, etc.).

2. `components-reference.html` — es la referencia visual y
   estructural de cada componente. Cada bloque está marcado con
   un comentario `<!-- COMPONENT: Name -->`. Reproducí cada uno
   como un componente de React, usando los tokens del paso 1.

Stack objetivo: [completá: React + Tailwind / shadcn / vanilla CSS / etc.]
Convención de nombres: PascalCase para componentes (Button, DataTable, …).

Empezá por: Button, Badge, Input, Card, Table — son los más usados.
Después seguí con: Modal, Drawer, Avatar, Menu, Toast.
Por último: Kanban, Wizard, Timeline, CommandPalette, FilterBuilder.

Para cada componente devolveme:
- El archivo .tsx con las variantes/props que mostraría el HTML
- Una historia mínima (Storybook o Ladle) si corresponde

Mantené la accesibilidad: aria, foco visible, tab order, contraste.
No inventes colores ni espaciados: usá únicamente los tokens.
```

## Design principles to preserve

1. **Claridad jerárquica** — cifras y datos críticos priman visualmente
2. **Consistencia cromática** — lime sólo para acción/positivo; coral sólo para negativo/pending
3. **Modularidad** — todo vive en cards o regiones bien delimitadas
4. **Calidez tecnológica** — geometría rigurosa + acentos orgánicos puntuales

## Naming convention recommended

| Categoría | Ejemplo |
|---|---|
| Componente | `<Button />`, `<DataTable />`, `<KanbanBoard />` |
| Variantes (prop `variant`) | `primary` `secondary` `outline` `ghost` |
| Tamaños (prop `size`) | `sm` `md` `lg` |
| Estados (prop o data-attr) | `disabled` `loading` `selected` |
| Tokens en código | `var(--color-primary)`, `var(--space-4)`, `var(--radius-md)` |

## Tokens you'll use most often

```css
/* Surfaces & text */
background: var(--color-surface);
color: var(--color-text);
border: 1px solid var(--color-border);

/* Spacing */
padding: var(--space-4) var(--space-5);
gap: var(--space-3);

/* Radius */
border-radius: var(--radius-md);

/* Action */
background: var(--color-primary);
color: var(--color-text-on-primary);

/* Focus */
outline: none;
box-shadow: var(--shadow-focus);
```

## Mapping al archivo "lindo" (sketchy)

El archivo `../Fynix Design System.html` (proyecto raíz) es la versión visual con anotaciones a mano alzada — pensada para revisión humana. **No la uses como referencia para código**: tiene estilo "boceto" (dashed borders, sombras planas tipo `3px 3px 0 #1a1a1a`, fuente Caveat) que NO es parte del sistema real.

Usá siempre este `components-reference.html` como source of truth visual.
