# @tanstack/react-table

- **Categoría:** Estado de servidor / data fetching (tablas)
- **Versión:** ^8.21.3
- **Status:** Accepted
- **Decidido en fase:** ADR 02 (implementación slice 2a — contacts list)
- **Fecha:** 2026-05-24

## Por qué la elegimos

Headless table engine: manejo de columnas, paginación manual (server-side), estado de tabla sin acoplamiento a UI. Parte del ecosistema TanStack ya adoptado (Router + Query). No infla el bundle: sin estilos propios, sin DOM emitido, pura lógica.

## Alternativas descartadas

- **Tabla HTML a mano:** viable para tablas simples, pero escala mal cuando se agregan sort, filtros, selección y density.
- **AG Grid / react-table v6:** opciones monolíticas con estilos propios; contradicen el modelo token-based del design system.

## Notas

- Se usa `useReactTable` + `getCoreRowModel` con `manualPagination: true`. El servidor pagina; el cliente no reslicea.
- Columnas sin `enableSorting`: la API de contactos no expone parámetro de sort; el sort client-only solo reordenaría la página actual (engañoso para el usuario).
- Componente genérico en `src/shared/ui/data-table.tsx`; columnas de dominio en `src/features/contacts/components/`.
