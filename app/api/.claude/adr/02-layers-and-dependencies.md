# ADR 02 — Capas y reglas de dependencia

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-20 (reorganización a carpetas por capa dentro del slice: `domain/` + `application/use-cases/` + `infrastructure/` + `http/` (con `dto/in/` y `dto/out/`) + `public/`. Port movido a `domain/` (hexagonal-pure). Reglas reescritas con los paths nuevos; suma `adr02-1b-port-contract`)
- **Decisores:** ifran
- **Fase del bootstrap:** 2

## Contexto

El ADR más importante: estas reglas las respeta Claude en cada sesión y se pueden enforzar automáticamente. En Vertical Slice las "capas" son estructura interna del slice + un shared kernel chico, no carpetas globales por capa.

## Decisión

Estructura confirmada (carpetas por capa dentro del slice; carpeta de slice en plural, archivos en singular):

```
app/api/
├── src/
│   ├── modules/
│   │   └── <feature-plural>/                  # ej: contacts/, users/, auth/
│   │       ├── domain/
│   │       │   ├── <entity-singular>.ts         # raíz del agregado (class) + *Props
│   │       │   ├── policies.ts                  # reglas puras del slice
│   │       │   ├── types/                       # sets cerrados / uniones (sin comportamiento)
│   │       │   ├── value-objects/               # VOs con validación/igualdad (si hay)
│   │       │   ├── entities/                    # entidades hijas NO-raíz
│   │       │   └── <entity>.repository.ts       # PORT: contrato del dominio con persistencia (hexagonal-pure)
│   │       ├── application/
│   │       │   └── use-cases/
│   │       │       └── <entity>-<acción>.use-case.ts  # con XxxInput / XxxDeps co-locados (ADR 03)
│   │       ├── infrastructure/
│   │       │   └── <entity>.repository.bun.ts   # adapter Drizzle (único que toca la DB)
│   │       ├── http/                            # capa de transporte (presentation)
│   │       │   ├── <entity>.routes.ts           # OpenAPIHono + createRoute + wiring
│   │       │   ├── <entity>.controller.ts       # solo funciones handler
│   │       │   └── dto/
│   │       │       ├── in/<entity>-<acción>.in.ts    # zod schema + z.infer (request/query)
│   │       │       └── out/<entity>-<concepto>.out.ts # zod schema + z.infer (view, reusable)
│   │       └── public/                          # solo cuando el módulo colabora cross-slice
│   │           ├── <entity>.public.ts           # contrato público: interface(s) + DTOs de borde, tipos puros
│   │           └── <entity>.public.impl.ts      # create<X>PublicApi(repo), wireada por el composition root
│   ├── shared/                               # shared kernel — NO conoce features
│   │   ├── errors/
│   │   ├── http/
│   │   ├── db/
│   │   ├── config/
│   │   ├── schemas/                           # zod compartido (problem, paginación)
│   │   ├── types/                             # tipos TS compartidos (Page, PageParams)
│   │   └── utils/                             # newId, etc.
│   ├── app.ts                                # composition root: arma Hono + cablea deps
│   └── server.ts                             # bootstrap (Bun.serve)
└── tests/                                    # ver ADR 06 (Pending)
```

> **Carpetas vacías NO se crean.** Si un slice no expone HTTP (ej. `users` solo se consume vía API pública), no existe `http/`. Si no tiene entidad nominal propia (ej. `auth` consume `UsersPublicApi`), no existen `domain/`, `infrastructure/` ni `public/`. La carpeta `value-objects/` se crea recién con el primer VO.

## Reglas concretas (verificables — enforzables con dependency-cruiser)

| # | Regla |
|---|---|
| 1 | El **conjunto de dominio puro del slice** — `src/modules/*/domain/` salvo el port — solo importa dentro de su propio `domain/` y de `src/shared/errors/**`. NUNCA Hono, NUNCA DB, NUNCA otro slice. |
| 1b | El **port** (`<entity>.repository.ts` dentro de `domain/`) es el contrato del dominio con la persistencia y es más permisivo que el dominio puro: puede importar adicionalmente `src/shared/types/**` (para `Page<T>`, `PageParams`) además de su propio `domain/` y `src/shared/errors/**`. NUNCA `http/`, `infrastructure/`, ni otro slice. |
| 2 | `src/modules/*/application/use-cases/**` importa archivos de SU propio `domain/` (incluyendo el port) + `src/shared/**`. NUNCA Hono, NUNCA `infrastructure/**`, NUNCA `http/**` de NINGÚN slice. |
| 3 | La capa presentation del slice vive en `http/` (`<entity>.routes.ts`, `<entity>.controller.ts`, `dto/in/*.in.ts`, `dto/out/*.out.ts`). `<entity>.controller.ts` importa los `use-cases/**` de SU slice + `src/shared/http/**`. `<entity>.routes.ts` importa sus DTOs (`dto/in,out/`) + el controller de SU slice. NINGÚN archivo bajo `http/` toca DB ni `infrastructure/` directamente. |
| 4 | `src/modules/*/infrastructure/<entity>.repository.bun.ts` (adapter) implementa el port y puede importar `src/shared/db/**`. Es el único que toca la DB. |
| 5 | **Slices aislados:** `src/modules/A/**` NO importa de `src/modules/B/**`. ÚNICA excepción: importar el contrato público `src/modules/B/public/<B>.public.ts` (solo `import type`). El resto de B (domain, application, infrastructure, http, `public.impl.ts`) sigue prohibido cross-slice. Ver "Colaboración cross-slice" abajo. |
| 6 | `src/shared/**` NO importa NADA de `src/modules/**`. El kernel no conoce features. |
| 7 | `src/app.ts` (composition root) es el ÚNICO que puede importar adapters concretos (`*.repository.bun.ts`) y las impl de API pública (`*.public.impl.ts`), y cablearlos. |

> La regla #5 es el corazón del Vertical Slice. Es la que más se viola sin querer — vigilarla.

> **Nota (ver ADR 12):** la capa presentation del slice vive bajo `http/`: `<entity>.routes.ts` (OpenAPIHono + createRoute + registro), `<entity>.controller.ts` (solo funciones handler), `dto/in/` y `dto/out/` (zod + `z.infer` del borde). El estilo está condicionado por la decisión de documentación/contrato de API — consultá `12-api-documentation.md` antes de crear o tocar rutas.

## Colaboración cross-slice (API pública por módulo)

Cuando un módulo necesita datos u operaciones de otro, la colaboración es por **API pública publicada por el proveedor**. No consumer-defined, no import directo de internals, no eventos (los eventos in-process quedan en ADR 03 §3.2 Pending con su trigger).

**Mecánica:**

- El módulo proveedor publica `src/modules/<m>/public/<entity>.public.ts`: SOLO interface(s) de operaciones + DTOs de borde. Tipos puros, cero imports runtime. Nada de use-cases, repository, entidades ni schemas.
- La implementación vive en `src/modules/<m>/public/<entity>.public.impl.ts`: `create<X>PublicApi(repo: <X>Repository): <X>PublicApi`. Adapta el PORT (en `domain/`, NUNCA el adapter concreto) y mapea a los DTOs publicados.
- El consumidor importa SOLO `<entity>.public.ts` con `import type`, y recibe la API por sus `Deps` (ADR 03). El composition root instancia el adapter, llama `create<X>PublicApi(repo)` e inyecta la API en el consumidor.

**Condiciones de correctitud (son REGLAS, no recomendaciones — sin ellas el patrón degrada a un monolito distribuido en un proceso):**

1. **Superficie mínima.** Se publica la operación mínima útil, revisada en PR. El contrato habla en operaciones intencionales y DTOs propios; NUNCA expone el repository, la entidad de dominio ni la forma interna del módulo.
2. **Enforcement obligatorio.** La excepción de la regla #5 está codificada en `.dependency-cruiser.js` con gate de CI. El patrón es válido solo mientras el gate se sostenga: quitarlo, o permitir cross-import a algo que no sea `<entity>.public.ts`, invalida la decisión.
3. **Sync solo para queries / comandos simples.** Hoy: llamada síncrona directa. Si una operación pasa a orquestar múltiples side-effects cross-módulo, se reevalúa hacia eventos in-process — ese es exactamente el trigger del Pending de ADR 03 §3.2.

DTOs, NUNCA entidades de dominio, cruzan el borde de módulo (coherente con ADR 03 §3.1; ver ADR 11 para el naming).

## Enforcement (cómo se verifican estas reglas)

**Decisión: `dependency-cruiser`** (ver `tech/dependency-cruiser.md`). No es opcional ni "either/or": las **9 reglas** (7 originales + `adr02-1b-port-contract` + `no-circular`) se traducen a `.dependency-cruiser.js` y se verifican automáticamente. Globs específicos por capa: `domain/`, `application/use-cases/`, `infrastructure/`, `http/`, `public/`.

Pasos (al scaffoldear el paquete, ANTES del primer feature):

1. `dependency-cruiser` como devDependency.
2. `.dependency-cruiser.js` traduciendo las reglas con los globs por capa.
3. Script `"arch": "depcruise src"` en `package.json`.
4. **Gate de CI obligatorio:** el pipeline corre `arch` y **falla ante cualquier violación**. Sin este paso, las reglas son un deseo, no una convención.
5. (Opcional) pre-commit hook para feedback antes de pushear.

> Una regla que solo vive en este markdown no se cumple sola. El gate de CI (paso 4) es lo que convierte estas reglas en una convención real.

> **Limitación conocida (blind spot del gate):** dependency-cruiser detecta IMPORTS, no globals. Ej. `Bun.password.verify` en un use-case no se detecta porque `Bun` no se importa — es un global del runtime. La regla #2 cubre imports de Hono/infrastructure/http, pero el acoplamiento a globals del runtime queda fuera del gate y se mitiga con review.

## Alternativas consideradas

- Carpetas globales por capa (`controllers/`, `services/`) — descartado: rompe la cohesión por feature del ADR 01.
- **Split plano en la raíz del slice** (sin wrapper `domain/`/`application/`/`infrastructure/`/`http/`) — fue la decisión original (2026-05-17 hasta 2026-05-20). **Revertida el 2026-05-20**: al madurar el slice (8 use-cases + presentation triplet + repo + public + dominio dividido) la raíz acumulaba ~9 archivos sueltos + 3 carpetas y degradaba la lectura. Las capas resuelven el ruido visual con costo de una indirección. La reversión consciente está documentada en el Historial.

## Consecuencias

**Positivas:** reglas verificables automáticamente; slices independientes; capas claras dentro del slice; cohesión visual; estructura predecible al crear un slice nuevo.

**Negativas / trade-offs:** un nivel más de indirección al navegar; enforcement requiere configurar dependency-cruiser; al port vivir en `domain/` hay sub-regla (#1b) para permitir `shared/types` (sin ella el dominio puro no podía usar `Page<T>`).

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
| 2026-05-17 | Nota cruzada: la capa presentation se escribe con OpenAPIHono+createRoute (ADR 12) | ifran |
| 2026-05-17 | Enforcement definido: dependency-cruiser + gate de CI obligatorio (sacado del "either/or" vago) | ifran |
| 2026-05-17 | Dominio del slice dividido en archivos/carpetas (agregado en <entidad>.ts, + types/ value-objects/ entities/ policies.ts); regla #1 reescrita al "conjunto de dominio del slice"; sincronizado con ADR 11 | ifran |
| 2026-05-17 | <entidad>.ts ahora incluye el estado del agregado (*Props); entities/ son solo hijas no-raíz | ifran |
| 2026-05-19 | Presentation por slice: `<feature>.routes.ts` → `<feature>.controller.ts`; schemas zod del borde extraídos a `<feature>.schemas.ts`. Sin cambios en reglas de dependencia. | ifran |
| 2026-05-19 | Refina la entrada anterior del mismo día: presentation por slice queda en 3 archivos — `<feature>.routes.ts` (OpenAPIHono + createRoute + registro), `<feature>.controller.ts` (solo funciones handler), `<feature>.schemas.ts` (zod del borde). Sin cambios en reglas de dependencia. | ifran |
| 2026-05-19 | Colaboración cross-slice formalizada: API pública por módulo (`<m>.public.ts` contrato + `<m>.public.impl.ts` impl). Regla #5 acota la excepción a `<m>.public.ts` type-only; regla #7 extendida a `*.public.impl.ts`. Nueva subsección con 3 condiciones de correctitud. Primera aplicación: auth consume `UsersPublicApi`, se eliminó `auth.port.ts`. | ifran |
| 2026-05-20 | **Reversión consciente del split plano**. Reorganización a carpetas por capa dentro del slice: `domain/`, `application/use-cases/`, `infrastructure/`, `http/` (con `dto/in/` + `dto/out/`), `public/`. Port movido a `domain/` (hexagonal-pure, flipea ADR 03 §3.3). Nueva regla `adr02-1b-port-contract` permite al port importar `src/shared/types`. Todos los globs de `.dependency-cruiser.js` reescritos por capa. Carpetas vacías NO se crean. Aplicado a contacts (8 use-cases, http completo), auth (sin domain/infra/public), users (sin http). Archivos en singular, carpeta del slice en plural (ADR 11). Sufijos `.use-case.ts` / `.in.ts` / `.out.ts` agregados (ADR 11). | ifran |
