# ADR 11 — Estructura de carpetas y naming

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 5.7

## Contexto

La estructura de carpetas quedó definida en el ADR 02 (slices + shared kernel). Falta cerrar las convenciones de nombres para evitar divergencia (`userRepo.ts` vs `customer-repository.ts` vs `DealRepository.ts` conviviendo).

## Decisión

| Qué | Convención |
|---|---|
| Archivos | `kebab-case` (`create-customer.ts`, `customers.repository.bun.ts`) |
| Tipos, clases, interfaces | `PascalCase` (`Customer`, `CustomersRepository`, `NotFoundError`) |
| Funciones, variables | `camelCase` (`createCustomer`, `dbClient`) |
| Constantes de módulo | `UPPER_SNAKE_CASE` |
| Sufijos de slice | `.routes.ts` (presentation) · `.repository.ts` (puerto) · `.repository.bun.ts` (adapter) · use-cases como `verbo-sustantivo.ts` |
| Carpeta de feature | **plural** (`customers/`, `deals/`, `activities/`) |
| Organización | por feature (Vertical Slice, ver ADR 01/02), NO por capa técnica global |

## Alternativas consideradas

- Carpetas de feature en singular — no elegido (se prefiere plural por consistencia).
- Filenames en camelCase — no elegido (kebab-case es el estándar adoptado).

## Consecuencias

**Positivas:** naming predecible; un archivo nuevo se nombra sin pensar; búsquedas consistentes.

**Negativas / trade-offs:** ninguno relevante; requiere disciplina (idealmente un linter de nombres a futuro).

## Reglas concretas

- Un slice nuevo: carpeta `src/modules/<feature-plural>/` con `<feature>.routes.ts`, `use-cases/<verbo-sustantivo>.ts`, `<feature>.ts` (domain), `<feature>.repository.ts` (puerto), `<feature>.repository.bun.ts` (adapter).
- Tipos/clases `PascalCase`, funciones/vars `camelCase`, archivos `kebab-case`, constantes `UPPER_SNAKE_CASE`.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
