# ADR — Capas y reglas de dependencia

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-26 (reversión del patrón de API pública por módulo: la colaboración cross-slice de lectura pasa a un read-port propio del consumidor sobre el schema compartido; reglas #2b/#5/#7 ajustadas)
- **Decisores:** ifran
- **Fase:** layers-and-dependencies

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
│   │       │       └── <entity>-<acción>.use-case.ts  # con XxxInput / XxxDeps co-locados (`inter-layer-communication.md`)
│   │       ├── infrastructure/
│   │       │   ├── <entity>.repository.bun.ts   # adapter Drizzle (único que toca la DB)
│   │       │   └── bootstrap.ts                 # mini composition-root del slice: instancia repo, use-cases, controller, router; retorna { router }
│   │       └── http/                            # capa de transporte (presentation)
│   │           ├── <entity>.routes.ts           # OpenAPIHono + createRoute + wiring; recibe el controller
│   │           ├── <entity>.controller.ts       # class <Entity>Controller con un método handler por ruta
│   │           └── dto/
│   │               ├── in/<entity>-<acción>.in.ts    # zod schema + z.infer (request/query)
│   │               └── out/<entity>-<concepto>.out.ts # zod schema + z.infer (view, reusable)
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
└── tests/                                    # ver `testing-strategy.md` (Pending)
```

> **Carpetas vacías NO se crean.** Si un slice no tiene entidad nominal propia (ej. `auth`, que solo lee datos de otro módulo vía un read-port propio), no existe `domain/` — pero **sí existe `infrastructure/`** porque ahí viven su `bootstrap.ts` y sus adapters de lectura. La carpeta `value-objects/` se crea recién con el primer VO.

## Reglas concretas (verificables — enforzables con dependency-cruiser)

| # | Regla |
|---|---|
| 1 | El **conjunto de dominio puro del slice** — `src/modules/*/domain/` salvo el port — solo importa dentro de su propio `domain/` y de `src/shared/errors/**`. NUNCA Hono, NUNCA DB, NUNCA otro slice. |
| 1b | El **port** (`<entity>.repository.ts` dentro de `domain/`) es el contrato del dominio con la persistencia y es más permisivo que el dominio puro: puede importar adicionalmente `src/shared/types/**` (para `Page<T>`, `PageParams`) además de su propio `domain/` y `src/shared/errors/**`. NUNCA `http/`, `infrastructure/`, ni otro slice. |
| 2 | `src/modules/*/application/use-cases/**` importa archivos de SU propio `domain/` (incluyendo el port) + `src/shared/**`. NUNCA Hono, NUNCA `infrastructure/**`, NUNCA `http/**` de NINGÚN slice. |
| 2b | **Read ports** (`src/modules/*/application/*.query.ts`) — contratos de lectura (CQRS-lite, `read-models-for-lists.md`): proyecciones de lista Y **lecturas cross-módulo / de detalle** (ej. auth leyendo datos de la tabla users). Pueden importar su propio `domain/` y `src/shared/**`. NUNCA Hono, NUNCA `infrastructure/`, NUNCA `http/`. Son la interfaz que el use-case consume en lugar del repository de dominio. |
| 3 | La capa presentation del slice vive en `http/` (`<entity>.routes.ts`, `<entity>.controller.ts`, `dto/in/*.in.ts`, `dto/out/*.out.ts`). `<entity>.controller.ts` es una **class** (`<Entity>Controller`) con un método handler por ruta; recibe las instancias de use-case por constructor (`constructor(ucs: <Entity>UseCases)`). Importa los `use-cases/**` de SU slice (sólo el tipo de la class) + `src/shared/http/**`. `<entity>.routes.ts` exporta `create<Entity>sRouter(controller: <Entity>Controller)`, importa sus DTOs (`dto/in,out/`) + el tipo del controller de SU slice. NINGÚN archivo bajo `http/` toca DB ni `infrastructure/` directamente. |
| 4 | `src/modules/*/infrastructure/<entity>.repository.bun.ts` y `src/modules/*/infrastructure/<entity>.query.drizzle.ts` (adapters) implementan sus respectivos ports y pueden importar `src/shared/db/**`. Junto con `infrastructure/bootstrap.ts` del MISMO slice (ver regla #7), son los únicos que tocan la DB dentro del slice. |
| 5 | **Slices aislados:** `src/modules/A/**` NO importa NADA de `src/modules/B/**`. **Sin excepción.** La colaboración cross-módulo NO es un import cross-slice: el consumidor obtiene los datos que necesita con un read-port propio (`application/*.query.ts` + adapter `infrastructure/*.query.drizzle.ts`) que lee el schema compartido `src/shared/db/**` (regla #4). Ver "Colaboración cross-slice" abajo. |
| 6 | `src/shared/**` NO importa NADA de `src/modules/**`. El kernel no conoce features. |
| 7 | **Composition root distribuido:** el wiring de adapters concretos y la instanciación de use-cases / controllers viven en (a) `src/modules/<m>/infrastructure/bootstrap.ts` para CADA slice — es el mini composition-root del módulo, autocontenido, y (b) `src/app.ts` que orquesta la composición global llamando a los `bootstrap*` de cada módulo y enrutándolos. Sólo estos archivos pueden importar `*.repository.bun.ts` y `*.query.drizzle.ts`. Cada `bootstrap.ts` puede cablear SOLO los archivos de SU PROPIO slice (la regla #5 sigue cubriendo el cross-slice). `app.ts` instancia las deps de borde (`db`) y las pasa a cada `bootstrap*`. |

> La regla #5 es el corazón del Vertical Slice. Es la que más se viola sin querer — vigilarla.

> **Nota (ver `api-documentation.md`):** la capa presentation del slice vive bajo `http/`: `<entity>.routes.ts` (OpenAPIHono + createRoute + registro), `<entity>.controller.ts` (solo funciones handler), `dto/in/` y `dto/out/` (zod + `z.infer` del borde). El estilo está condicionado por la decisión de documentación/contrato de API — consultá `api-documentation.md` antes de crear o tocar rutas.

## Colaboración cross-slice (lectura directa por read-port del consumidor)

Cuando un módulo necesita **datos** de otro, NO hay contrato publicado por el proveedor ni inyección cross-slice. El **consumidor** se hace cargo: define un read-port propio y un adapter que lee el schema compartido.

**Mecánica:**

- El consumidor define el read-port en `src/modules/<consumidor>/application/<x>.query.ts`: interface(s) con las operaciones de lectura que necesita + los read models (DTOs planos) con SOLO las propiedades que va a usar. Tipos puros, sin imports de runtime de otro slice.
- La implementación vive en `src/modules/<consumidor>/infrastructure/<x>.query.drizzle.ts`: hace el SELECT/JOIN sobre las tablas que necesita del schema compartido `@shared/db` (incluidas tablas "de" otro módulo) y mapea al read model. Sigue las reglas de DB de los adapters (#4 y #7).
- El use-case del consumidor depende del read-port (no del repository de otro slice). El composition root del consumidor instancia el adapter con `db`.

**Consecuencias y límites (leer — esto REEMPLAZA una decisión anterior):**

1. **El proveedor no expone nada.** Se eliminó el patrón de API pública por módulo (`public/<entity>.public.ts` + `.public.impl.ts`). Cada consumidor lee lo que necesita directo del schema compartido.
2. **El gate de dependency-cruiser queda CIEGO al acoplamiento cross-módulo.** La regla #5 sigue prohibiendo imports `modules/A → modules/B`, pero el acoplamiento real se mudó a la lectura del schema compartido (`@shared/db`), que el gate permite (#4) y NO inspecciona. El consumidor depende de la forma de las tablas de otro módulo sin contrato que lo proteja. **Riesgo asumido conscientemente** (ver Historial 2026-05-26); se mitiga SOLO con review.
3. **Solo cubre LECTURAS.** No hay mecanismo para invocar OPERACIONES de otro módulo (validaciones, comandos). Si aparece esa necesidad, hay que **reabrir esta decisión** (no improvisar): el read-port no resuelve comportamiento cross-módulo.
4. **Datos sensibles cruzan sin filtro de contrato.** Ej. auth lee `passwordHash` directo de la tabla `users`. Es responsabilidad del consumidor no propagar en su read model más de lo que necesita.

Read models planos, NUNCA entidades de dominio de otro slice, cruzan el borde (coherente con `inter-layer-communication.md` §3.1; ver `folder-structure.md` para el naming).

## Enforcement (cómo se verifican estas reglas)

**Decisión: `dependency-cruiser`** (ver `tech/dependency-cruiser.md`). No es opcional ni "either/or": las **10 reglas** (7 originales + `adr02-1b-port-contract` + `adr02-2b-read-port` + `no-circular`) se traducen a `.dependency-cruiser.js` y se verifican automáticamente. Globs específicos por capa: `domain/`, `application/use-cases/`, `application/*.query.ts`, `infrastructure/`, `http/`. (Al eliminarse el patrón de API pública, la regla #5 quedó sin excepción y la #7 dejó de listar `*.public.impl.ts`; el cambio en `.dependency-cruiser.js` se aplica junto con la migración del código.)

Pasos (al scaffoldear el paquete, ANTES del primer feature):

1. `dependency-cruiser` como devDependency.
2. `.dependency-cruiser.js` traduciendo las reglas con los globs por capa.
3. Script `"arch": "depcruise src"` en `package.json`.
4. **Gate de CI obligatorio:** el pipeline corre `arch` y **falla ante cualquier violación**. Sin este paso, las reglas son un deseo, no una convención.
5. (Opcional) pre-commit hook para feedback antes de pushear.

> Una regla que solo vive en este markdown no se cumple sola. El gate de CI (paso 4) es lo que convierte estas reglas en una convención real.

> **Limitación conocida (blind spot del gate):** dependency-cruiser detecta IMPORTS, no globals. Ej. `Bun.password.verify` en un use-case no se detecta porque `Bun` no se importa — es un global del runtime. La regla #2 cubre imports de Hono/infrastructure/http, pero el acoplamiento a globals del runtime queda fuera del gate y se mitiga con review.

## Alternativas consideradas

- Carpetas globales por capa (`controllers/`, `services/`) — descartado: rompe la cohesión por feature de `architecture-style.md`.
- **Split plano en la raíz del slice** (sin wrapper `domain/`/`application/`/`infrastructure/`/`http/`) — fue la decisión original (2026-05-17 hasta 2026-05-20). **Revertida el 2026-05-20**: al madurar el slice (8 use-cases + presentation triplet + repo + public + dominio dividido) la raíz acumulaba ~9 archivos sueltos + 3 carpetas y degradaba la lectura. Las capas resuelven el ruido visual con costo de una indirección. La reversión consciente está documentada en el Historial.

## Consecuencias

**Positivas:** reglas verificables automáticamente; slices independientes; capas claras dentro del slice; cohesión visual; estructura predecible al crear un slice nuevo.

**Negativas / trade-offs:** un nivel más de indirección al navegar; enforcement requiere configurar dependency-cruiser; al port vivir en `domain/` hay sub-regla (#1b) para permitir `shared/types` (sin ella el dominio puro no podía usar `Page<T>`).
