# EDR — Styling y Design System (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-23
- **Última actualización:** 2026-05-23
- **Decisores:** ifran
- **Fase:** styling-and-design-system

## Contexto

`app/ui` no tenía decisión de estilos: ni catálogo de tech para CSS, ni convención de design-system más allá del `../structure/folder-structure.md`. Existe un handoff de diseño en `docs/visual/handoff/` (`tokens.css` como source of truth + `components-reference.html` como referencia visual) que hay que portar al paquete. Este EDR elige el stack de estilos y cómo se integra con la estructura ya definida (`../structure/layers-and-dependencies.md` / `../structure/folder-structure.md`).

## Decisión

### Stack
- **Tailwind CSS v4** en modelo CSS-first: los design tokens viven en CSS vía `@theme`, no en `tailwind.config.js`.
- **shadcn/ui** como sistema de componentes: copy-paste sobre Radix, el código vive en el repo (no es dependencia cerrada) y se gestiona con el CLI.

### Tokens — arquitectura de 3 capas
Viven en `src/app/globals.css`. Source of truth: `docs/visual/handoff/tokens.css`.
1. **Primitivos** — todo el `tokens.css` portado bajo el prefijo `--ds-*` (`--ds-color-primary-400`, `--ds-color-bg`, `--ds-space-4`, `--ds-radius-md`…). Se re-namespacea para liberar los namespaces `--color-*`/`--radius-*` que Tailwind v4 reserva en `@theme`.
2. **Roles semánticos shadcn** — `--background`, `--foreground`, `--primary`, `--ring`, `--card`, `--border`… apuntan a los primitivos `--ds-*`.
3. **Exposición a Tailwind** — `@theme inline` mapea los roles a `--color-*`/`--radius-*`/`--font-*` para generar las utilities (`bg-primary`, `rounded-md`…).
- Nunca se inventan colores ni espaciados fuera de los tokens.

### Ubicación de componentes
- Componentes base, genéricos y agnósticos de dominio (los de shadcn + propios reutilizables) → `src/shared/ui/` (plano, ver `../structure/folder-structure.md` actualizado).
- Componentes que conocen dominio o que solo usa un feature → `src/features/<f>/components/` (reglas 1/2/6 del `../structure/layers-and-dependencies.md`).
- Los distintivos del handoff (Kanban, Timeline, FilterBuilder, CommandPalette, Wizard) son, en su mayoría, de feature (conocen `pipelineState`, `eventType`, etc.): se construyen a mano sobre primitivas shadcn (Command, Dialog, Popover). No se suben a `shared/ui` salvo que sean genuinamente reutilizables (YAGNI).

### Referencia visual
- Source of truth visual: `docs/visual/handoff/tokens.css` + `components-reference.html`.
- `docs/visual/brand-manual.md` describe un producto FinTech distinto (Fynix): sirve como guía cromática/tipográfica general, **NO** como guía de composición/layout para el CRM.

### Tipografía
- La fuente **General Sans** (Fontshare) se carga vía **CDN de Fontshare** (`<link>` + `preconnect` en `index.html`), pesos 400/500/600/700. Trade-off aceptado: dependencia de un tercero en runtime (latencia / privacidad / offline) a cambio de setup mínimo. Si se prioriza performance/privacidad, migrar a self-hosted (`@font-face` + `.woff2`).

## Reglas concretas

- Tokens: usar siempre `var(--token)`; nunca hex ni valores crudos en componentes.
- `shadcn add`: el CLI apunta a `src/shared/ui` (alias en `components.json`). Los componentes generados quedan en kebab-case (`../structure/folder-structure.md`).
- El mapeo primitivos `--ds-*` → roles shadcn vive solo en `globals.css` (capa 2); no duplicar por componente.
- `shared/ui` es presentacional puro (`../structure/layers-and-dependencies.md` regla 6): los componentes shadcn no se acoplan a API/Query.

## Alternativas consideradas

- **Tailwind v3 (config.js)** — descartado: legacy; v4 CSS-first encaja directo con tokens que ya están en CSS.
- **Componentes propios desde cero** — descartado: shadcn aporta accesibilidad (Radix) y un punto de partida estilizable; el custom total es posible porque el código es propio.
- **Mantener los nombres del handoff tal cual (`--color-*`) + puente** — descartado: el handoff usa los namespaces `--color-*`/`--radius-*`/`--shadow-*` que Tailwind v4 reserva en `@theme`, lo que genera colisiones; se re-namespacea a `--ds-*` (capa primitiva) para separación limpia.

## Consecuencias

**Positivas:** stack actual y alineado al handoff; accesibilidad de base por Radix; tokens centralizados; CLI de shadcn operativo.

**Negativas / trade-offs:** hay que mantener el mapeo handoff → shadcn; al actualizar componentes con el CLI puede haber que re-aplicar ajustes de estilo; dark mode pendiente.

## Pendientes

- **Dark mode:** `Pending`. El `tokens.css` v0.2 lo deja como placeholder. Se define cuando se priorice; el esquema de tokens ya contempla overrides.

## Dependencias nuevas

Ver `../tech/tailwindcss.md` y `../tech/shadcn.md` (este último lista las deps satélite que arrastra shadcn).
