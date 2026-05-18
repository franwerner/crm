# ADR 11 — Estructura de carpetas y naming

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17 (entities/ redefinido a hijas no-raíz; *Props vive con la raíz)
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

### Estructura interna del dominio de un slice

Split plano, sin wrapper `domain/`, sin barrel `index.ts`. Imports directos al archivo.

| Archivo / carpeta | Rol |
|---|---|
| `<entidad>.ts` (singular, kebab-case) | La **raíz del agregado** (`class`) **y su shape de estado** (`*Props`). Único punto de entrada del agregado y único con repository. El archivo de la raíz vive en la raíz del slice, nunca dentro de `entities/`. |
| `types/` | Conjuntos cerrados y uniones de dominio **sin identidad ni comportamiento** (enums `as const`, discriminated unions); un archivo por tipo. |
| `value-objects/` | Value Objects con validación/igualdad; carpeta creada recién al primer VO. |
| `entities/` | **Entidades hijas NO-raíz del agregado**: parte del agregado raíz, alcanzadas y persistidas SOLO a través del repository de la raíz, sin repository ni límite de consistencia propio. Un archivo por entidad. Una hija se promueve a `class` solo cuando gana invariantes/comportamiento propios que no deban vivir en la raíz. |
| `policies.ts` | Funciones puras de reglas de dominio del slice. |

Sin barrel `index.ts`: imports directos al archivo.

## Alternativas consideradas

- Carpetas de feature en singular — no elegido (se prefiere plural por consistencia).
- Filenames en camelCase — no elegido (kebab-case es el estándar adoptado).
- Wrapper `domain/` — descartado: anidación extra redundante en cada slice.
- Split mínimo solo `types/` + `value-objects/` — descartado: `ContactProps`, entidades y políticas seguían mezcladas con el agregado.
- Meter la raíz del agregado dentro de `entities/` — descartado: borra la asimetría raíz/hija (la raíz es el único con repository y límite de consistencia) y reconstruye de facto el wrapper `domain/` ya descartado.

## Consecuencias

**Positivas:** naming predecible; un archivo nuevo se nombra sin pensar; búsquedas consistentes.

**Negativas / trade-offs:** ninguno relevante; requiere disciplina (idealmente un linter de nombres a futuro).

## Reglas concretas

- Un slice nuevo: carpeta `src/modules/<feature-plural>/` con `<feature>.routes.ts`, `use-cases/<verbo-sustantivo>.ts`, `<entidad>.ts` (raíz del agregado + su `*Props`), `types/` (tipos cerrados), `entities/` (entidades hijas NO-raíz), `policies.ts` (reglas puras), `<feature>.repository.ts` (puerto), `<feature>.repository.bun.ts` (adapter). La carpeta `value-objects/` se crea solo cuando existe el primer VO.
- Tipos/clases `PascalCase`, funciones/vars `camelCase`, archivos `kebab-case`, constantes `UPPER_SNAKE_CASE`.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
| 2026-05-17 | Dominio del slice dividido: agregado en <entidad>.ts + types/ + value-objects/ + entities/ + policies.ts (antes todo en <feature>.ts). Sincronizado con ADR 02 | ifran |
| 2026-05-17 | Afinado: <entidad>.ts contiene la raíz del agregado + su *Props; entities/ redefinido como entidades hijas NO-raíz (sin repository ni consistencia propia); ContactProps movido a contact.ts | ifran |
