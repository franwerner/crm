# React

- **Categoría:** Framework UI
- **Versión:** latest estable / sin pinear (greenfield — pinear con caret al inicializar)
- **Status:** Accepted
- **Decidido en fase:** 0
- **Fecha:** 2026-05-17

## Por qué la elegimos

Un CRM es tablas, formularios, filtros, paginación y estado de servidor por todos lados. React tiene el ecosistema más maduro para resolver esas piezas sin construirlas desde cero, y el mejor soporte de kubb (`@kubb/plugin-react-query`).

## Alternativas descartadas

- **Vue 3:** sólido, kubb lo soporta (vue-query), pero ecosistema CRM algo menor.
- **SolidJS:** muy rápido, API parecida, pero ecosistema más chico (más cosas a mano).
- **Svelte 5:** gran DX, pero menos componentes de CRM listos.

## Notas

- SPA client-side (ver `00-context.md`). Sin SSR/SSG.
- El estado de servidor NO se maneja con estado de React crudo: va por TanStack Query (ver `tanstack-query.md`).
