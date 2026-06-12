# uuidv7

- **Categoría:** Otro (generación de identidad / UUID)
- **Versión:** 1.2.1
- **Status:** Accepted
- **Decidido en fase:** data-access
- **Fecha:** 2026-05-17

## Por qué la elegimos

Genera UUID v7 conforme a RFC 9562, cero dependencias transitivas, mínimo y garantiza monotonicidad dentro del mismo milisegundo. Eso es exactamente el motivo de elegir v7 sobre v4: orden temporal en la representación binaria → localidad de índice B-tree. No hay generador v7 nativo en Bun ni en Node (`crypto.randomUUID()` produce v4).

## Alternativas descartadas

- **uuid (v9+):** estándar de facto y expone v7, pero más superficie de la que se usa y monotonicidad sub-ms menos explícita.
- **Implementación propia (~20 líneas):** sin dependencia pero pasás a ser dueño de la corrección de un generador RFC 9562 (layout de bits, monotonicidad, regresión de reloj); riesgo alto en un punto donde un bug es difícil de detectar.
- **Generación en la DB (Postgres `uuidv7()`/`gen_random_uuid()`):** contradice `../data/data-modeling.md` (id generado por la app en el borde, PK sin DEFAULT) y `gen_random_uuid()` es v4.

## Notas

El único punto de uso sancionado es el generador compartido `src/shared/id` (función `newId`). Los use-cases deben importar de ahí; no deben llamar a `crypto.randomUUID()` (produce v4) ni instanciar `uuidv7` directamente.
