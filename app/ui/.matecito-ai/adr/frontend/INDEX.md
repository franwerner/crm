# Dominio: frontend — Índice

**Criterio de pertenencia:** ADRs específicos de la capa de presentación de la SPA: styling y design system, routing y guards, y patrones de UI (vistas de listado schema-driven, CRUD inline vs modal).

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [styling-and-design-system.md](styling-and-design-system.md) | Accepted | Styling y Design System | Toques estilos, tokens, Tailwind, shadcn/ui; ubiques un componente en `shared/ui` vs feature. |
| [routing.md](routing.md) | Accepted | Routing y guards | Definas rutas, el árbol del router, protección de rutas privadas o search params. |
| [schema-driven-list-views.md](schema-driven-list-views.md) | Accepted | Schema-driven list views | Construyas o toques una vista de listado (tabla/filtros/sort/search); definas columnas o filtros de una entidad; agregues un campo a un listado. |
| [crud-ui-patterns.md](crud-ui-patterns.md) | Accepted | CRUD UI: inline vs modal | Construyas un detail page; agregues edición/creación/borrado de un campo escalar o de una colección de subentidades; dudes entre `InlineField` o modal. |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `web-spa` pero sin ADR propio en esta etapa.

| Concern | Razón |
|---|---|
| accessibility | Sin ADR dedicado todavía; ARIA/semántica provistas por Radix UI (ver `../tech/radix-ui.md`). Reconsiderar si se formaliza una política a11y. |
