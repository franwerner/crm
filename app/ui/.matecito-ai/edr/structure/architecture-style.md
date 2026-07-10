# EDR — Estilo arquitectónico y acoplamiento (app/ui)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** architecture-style

## Contexto

Un CRM frontend tiene muchas features relativamente independientes (customers, deals, activities). El error clásico es organizar por tipo de archivo (`components/`, `hooks/`, `utils/`) — no escala. Además, gran parte de la "lógica" ya está externalizada en kubb + TanStack Query.

## Decisión

- **Patrón:** **Feature-based / feature folders**. Cohesión por feature. `shared/` para lo transversal, `app/` para composición.
- **Acoplamiento:** **Container/Presentational + hooks**. Componentes presentacionales tontos (props → UI). Lógica de feature en custom hooks que orquestan los hooks generados por kubb. Sin capa de dominio framework-agnostic (kubb+Query ya externaliza el estado de servidor — agregarla sería sobre-ingeniería).

## Alternativas consideradas

- **Organización por tipo de archivo:** no escala en un CRM con muchas features.
- **Layered/Clean front (dominio/casos de uso):** ceremonia alta; duplica lo que kubb+Query ya resuelve.
- **Acoplamiento directo (fetch+lógica en componentes):** difícil de testear/reusar, ensucia componentes.

## Consecuencias

**Positivas:** cohesión por feature; UI testeable y reusable; coherente con kubb+Query.

**Negativas / trade-offs:** requiere disciplina para no meter lógica/fetching en componentes presentacionales (ver regla #4 del `layers-and-dependencies.md`).

## Reglas concretas

- Componentes presentacionales: reciben datos por props, no fetchean, no conocen kubb/Query.
- Lógica de orquestación: en `features/<f>/hooks/`, consumiendo los hooks de kubb.
