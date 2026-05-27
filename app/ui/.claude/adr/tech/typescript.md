# TypeScript

- **Categoría:** Lenguaje
- **Versión:** latest / sin pinear (greenfield — pinear como devDependency al inicializar)
- **Status:** Accepted
- **Decidido en fase:** context
- **Fecha:** 2026-05-17

## Por qué la elegimos

Tipado estático: contratos explícitos en componentes/props/estado y refactors seguros. Imprescindible para aprovechar los tipos que kubb genera del OpenAPI de `app/api` — el contrato de API llega tipado de punta a punta.

## Alternativas descartadas

- **JavaScript plano:** sin tipos se pierde todo el valor del cliente tipado que genera kubb; descartado.

## Notas

- `tsconfig.json` en modo estricto (`strict: true`, `noUncheckedIndexedAccess`) al inicializar.
- Los tipos de la API NO se escriben a mano: los genera kubb desde el OpenAPI (ver `kubb.md`). No duplicar tipos del contrato manualmente.
