# Dominio: frontend — Índice

**Criterio de pertenencia:** EDRs específicos de la capa de presentación de la SPA: styling y design system, routing y guards, patrones de UI (vistas de listado schema-driven, CRUD inline vs modal), polling de estado, wizards multi-step y navegación de sub-secciones.

| EDR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [styling-and-design-system.md](styling-and-design-system.md) | Accepted | Styling y Design System | Toques estilos, tokens, Tailwind, shadcn/ui; ubiques un componente en `shared/ui` vs feature. |
| [routing.md](routing.md) | Accepted | Routing y guards | Definas rutas, el árbol del router, protección de rutas privadas o search params. |
| [schema-driven-list-views.md](schema-driven-list-views.md) | Accepted | Schema-driven list views | Construyas o toques una vista de listado (tabla/filtros/sort/search); definas columnas o filtros de una entidad; agregues un campo a un listado. |
| [crud-ui-patterns.md](crud-ui-patterns.md) | Accepted | CRUD UI: inline vs modal | Construyas un detail page; agregues edición/creación/borrado de un campo escalar o de una colección de subentidades; dudes entre `InlineField` o modal. |
| [polling-with-refetchinterval.md](polling-with-refetchinterval.md) | Accepted | Polling de estado con `refetchInterval` | Necesites refrescar un recurso que avanza server-side (estado de import, insight de enrichment) hasta un estado terminal. |
| [multistep-wizard-usereducer.md](multistep-wizard-usereducer.md) | Accepted | Wizard multi-step con `useReducer` | Construyas un flujo de varios pasos encadenados con mutation por paso (ingesta: upload→mapping→template→processing). |
| [settings-subsection-navigation.md](settings-subsection-navigation.md) | Accepted | Navegación de sub-secciones de Config | Agregues una sub-sección de Configuración (ej. Templates) y dudes entre submenú en sidebar o ruta hija de `/settings`. |

## No aplican (N/A)

Concerns que la matriz marca relevantes para `web-spa` pero sin EDR propio en esta etapa.

| Concern | Razón |
|---|---|
| accessibility | Sin EDR dedicado todavía; ARIA/semántica provistas por Radix UI (ver `../tech/radix-ui.md`). Reconsiderar si se formaliza una política a11y. |
