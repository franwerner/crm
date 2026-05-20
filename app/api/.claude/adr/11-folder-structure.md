# ADR 11 — Estructura de carpetas y naming

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-20 (reversión consciente del "split plano": estructura por capas dentro del slice (`domain/` + `application/use-cases/` + `infrastructure/` + `http/` + `public/`) + sufijos `.use-case.ts` / `.in.ts` / `.out.ts` + orden `<sustantivo>-<acción>` para use-cases y DTOs in + archivos en singular)
- **Decisores:** ifran
- **Fase del bootstrap:** 5.7

## Contexto

La estructura de carpetas quedó definida en el ADR 02 (slices + shared kernel). Faltó cerrar las convenciones de nombres y, al madurar el slice, también la organización interna por capas (la raíz plana acumulaba demasiados archivos sueltos).

## Decisión

### Convenciones generales

| Qué | Convención |
|---|---|
| Archivos | `kebab-case` (`contact-create.use-case.ts`, `contact.routes.ts`) |
| Tipos, clases, interfaces | `PascalCase` (`Contact`, `ContactsRepository`, `NotFoundError`) |
| Funciones, variables | `camelCase` (`createContact`, `dbClient`) |
| Constantes de módulo | `UPPER_SNAKE_CASE` |
| Carpeta de feature (slice) | **plural** (`contacts/`, `users/`, `auth/`) |
| Archivos dentro del slice | **singular** según la entidad (`contact.ts`, `contact.routes.ts`, `user.public.ts`) |
| Organización | por feature (Vertical Slice, ver ADR 01/02), NO por capa técnica global |

### Sufijos por rol

| Sufijo | Capa | Rol |
|---|---|---|
| `.routes.ts` | `http/` | OpenAPIHono + createRoute + wiring (presentation) |
| `.controller.ts` | `http/` | Solo funciones handler (presentation) |
| `.in.ts` | `http/dto/in/` | Zod schema + `z.infer` del request/query |
| `.out.ts` | `http/dto/out/` | Zod schema + `z.infer` de la view (reusable por concepto) |
| `.use-case.ts` | `application/use-cases/` | Caso de uso con `XxxInput` + `XxxDeps` co-locados (ADR 03) |
| `.repository.ts` | `domain/` | PORT del repo (hexagonal-pure, ADR 03 §3.3) |
| `.repository.bun.ts` | `infrastructure/` | Adapter Drizzle |
| `.public.ts` | `public/` | Contrato público del módulo (interface + DTOs, tipos puros) |
| `.public.impl.ts` | `public/` | Impl de la API pública (`create<X>PublicApi(repo)`), wireada por el composition root |

### Orden de nombre

- **Use-cases y DTOs de input:** `<sustantivo>-<acción>` (ej. `contact-create.use-case.ts`, `contact-register-event.in.ts`). Agrupa alfabéticamente por entidad cuando hay muchos archivos.
- **DTOs de output:** `<sustantivo>-<concepto>` (ej. `contact.out.ts`, `contact-list.out.ts`). Una view por concepto, reusable entre endpoints.
- **Routes/controller:** `<entity>.routes.ts` / `<entity>.controller.ts` (singular).
- **Edge case sin entidad-sustantivo (ej. `auth`):** la acción nombra el archivo y la carpeta del slice desambigua (`login.use-case.ts`, `login.in.ts`, `login.out.ts`).

### Estructura interna del slice (por capa)

| Carpeta | Rol | Reglas |
|---|---|---|
| `domain/` | Lógica pura del dominio + port abstracto | Contiene `<entity>.ts` (raíz del agregado + `*Props`), `policies.ts`, `types/`, `value-objects/`, `entities/`, y el PORT `<entity>.repository.ts`. ADR 02 reglas #1 (puro) y #1b (port permite `shared/types`). |
| `application/` | Casos de uso del slice | Contiene `use-cases/<entity>-<acción>.use-case.ts`. ADR 03: `XxxInput`/`XxxDeps` co-locados; firma `xxx(input, deps)`. ADR 02 regla #2: sin Hono, sin infrastructure, sin http. |
| `infrastructure/` | Adapters concretos | Contiene `<entity>.repository.bun.ts`. Único punto que toca Drizzle/DB (ADR 02 #4). |
| `http/` | Transporte HTTP (presentation) | Contiene `<entity>.routes.ts`, `<entity>.controller.ts`, `dto/in/<entity>-<acción>.in.ts`, `dto/out/<entity>-<concepto>.out.ts`. ADR 02 #3: sin DB ni adapter directo. |
| `public/` | API pública del módulo (solo cross-slice) | Contiene `<entity>.public.ts` (contrato) y `<entity>.public.impl.ts` (impl). Ver ADR 02 "Colaboración cross-slice". |

**Reglas duras**:
- **Carpetas vacías NO se crean.** Si un slice no expone HTTP (`users` solo se consume vía API pública), no existe `http/`. Si no tiene entidad nominal (`auth` consume `UsersPublicApi`), no existen `domain/`, `infrastructure/` ni `public/`. La carpeta `value-objects/` se crea recién con el primer VO.
- **NO barrel `index.ts`**. Imports directos al archivo.
- La raíz del agregado vive en `domain/<entity>.ts`, nunca dentro de `entities/` (que es solo entidades hijas no-raíz).

## Alternativas consideradas

- Carpetas de feature en singular — no elegido (se prefiere plural por consistencia con colecciones).
- Filenames en camelCase — no elegido (kebab-case es el estándar adoptado).
- **Split plano en la raíz del slice** (sin wrapper `domain/`/`application/`/etc.) — fue la decisión original (2026-05-17 hasta 2026-05-20). **Revertida el 2026-05-20**: al madurar el slice, la raíz acumulaba ~9 archivos sueltos + 3 carpetas, y degradaba la lectura. Las capas resuelven el ruido con costo de una indirección. Ver ADR 02 "Alternativas" para el mismo contexto.
- **`<verbo-sustantivo>` (`create-contact.ts`) para use-cases** — fue la decisión original. **Revertida el 2026-05-20**: al sumar `.use-case.ts` y agrupar todos los use-cases en `application/use-cases/`, el orden `<sustantivo>-<acción>` agrupa alfabéticamente por entidad. El sufijo `.use-case.ts` ya transmite la naturaleza de acción; el verbo al final lee bien y agrupa mejor.
- **DTOs sin folder `dto/`, todo en un único `<feature>.schemas.ts`** — fue la decisión original. **Revertida el 2026-05-20**: al crecer el slice (8 endpoints con sus inputs y views), el archivo monolítico se volvió pesado y mezclaba in/out. Split en `dto/in/` (zod schema del request, archivo por endpoint) + `dto/out/` (zod schema de la view, archivo por concepto reusable). Cada archivo exporta su `Schema` + `z.infer<...>` en el MISMO archivo (ADR 03 §3.1 single source of truth dentro del archivo).
- Sufijos redundantes folder+filename (`.use-case.ts` en `use-cases/`, `.in.ts` en `dto/in/`, etc.) — elegido conscientemente: el folder agrupa, el sufijo da grep-friendliness global (`*.use-case.ts`, `*.in.ts`).
- Importar enums del dominio en los DTOs zod — descartado por convención (ver ADR 03 §3.1 "Closed types del dominio en los DTOs").
- Meter la raíz del agregado dentro de `entities/` — descartado: borra la asimetría raíz/hija (la raíz es el único con repository y límite de consistencia).

## Consecuencias

**Positivas:** naming predecible; un archivo nuevo se nombra sin pensar; búsquedas consistentes; agrupación por entidad mejora descubribilidad cuando el slice crece; sufijos explícitos permiten grep global (`*.use-case.ts`, `*.in.ts`, `*.out.ts`).

**Negativas / trade-offs:** archivos con nombres más largos por los sufijos; un nivel más de indirección por la estructura de capas; requiere disciplina (idealmente un linter de nombres a futuro).

## Reglas concretas

- Un slice nuevo: carpeta `src/modules/<feature-plural>/` con las sub-carpetas por capa que tengan contenido. Mínimo común: `domain/<entity>.ts` + `application/use-cases/<entity>-<acción>.use-case.ts`. Si expone HTTP: `http/<entity>.routes.ts` + `http/<entity>.controller.ts` + `http/dto/in/` + `http/dto/out/`. Si persiste: `domain/<entity>.repository.ts` (PORT) + `infrastructure/<entity>.repository.bun.ts`. Si colabora cross-slice: `public/<entity>.public.ts` + `public/<entity>.public.impl.ts`.
- Carpetas vacías NO se crean.
- Tipos/clases `PascalCase`, funciones/vars `camelCase`, archivos `kebab-case`, constantes `UPPER_SNAKE_CASE`.
- Singular en archivos (`contact.ts`), plural en la carpeta del slice (`contacts/`).
- Orden `<sustantivo>-<acción>` en use-cases y DTOs in; `<sustantivo>-<concepto>` en DTOs out.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
| 2026-05-17 | Dominio del slice dividido: agregado en <entidad>.ts + types/ + value-objects/ + entities/ + policies.ts (antes todo en <feature>.ts). Sincronizado con ADR 02 | ifran |
| 2026-05-17 | Afinado: <entidad>.ts contiene la raíz del agregado + su *Props; entities/ redefinido como entidades hijas NO-raíz (sin repository ni consistencia propia); ContactProps movido a contact.ts | ifran |
| 2026-05-19 | Presentation por slice: `<feature>.routes.ts` → `<feature>.controller.ts`; schemas zod del borde extraídos a `<feature>.schemas.ts`. Sin cambios en reglas de dependencia. | ifran |
| 2026-05-19 | Refina la entrada anterior del mismo día: presentation por slice queda en 3 archivos — `<feature>.routes.ts` (OpenAPIHono + createRoute + registro), `<feature>.controller.ts` (solo funciones handler), `<feature>.schemas.ts` (zod del borde). Sin cambios en reglas de dependencia. | ifran |
| 2026-05-19 | Sumados sufijos `.public.ts` (contrato público del módulo) y `.public.impl.ts` (impl de API pública, wireada por el composition root). Mecánica y reglas en ADR 02 "Colaboración cross-slice". | ifran |
| 2026-05-20 | **Reversión del split plano**: estructura por capas dentro del slice (`domain/`, `application/use-cases/`, `infrastructure/`, `http/`, `public/`). Archivos en singular (entidad), carpeta del slice en plural. Sufijos `.use-case.ts`, `.in.ts`, `.out.ts` explícitos. DTOs partidos en `http/dto/in/<entity>-<acción>.in.ts` + `http/dto/out/<entity>-<concepto>.out.ts` (cada archivo con su zod + `z.infer`). Orden `<sustantivo>-<acción>` para use-cases y DTOs in (revierte `<verbo-sustantivo>` original). Edge case auth: archivos nombrados por acción (`login.use-case.ts`). Carpetas vacías NO se crean. Razón: la raíz del slice acumulaba ~9 archivos sueltos al madurar y degradaba la lectura. | ifran |
