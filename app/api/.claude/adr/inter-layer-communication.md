# ADR — Comunicación entre capas

- **Status:** Accepted (con sub-decisión §3.2 en Pending)
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-26 (reversión del patrón de API pública por módulo: el borde cross-slice de lectura pasa a read-port propio del consumidor — ver `layers-and-dependencies.md`/`dependency-injection.md`/`read-models-for-lists.md`)
- **Decisores:** ifran
- **Fase:** inter-layer-communication

## Contexto

Define cómo viajan los datos entre handler, use-case y repo dentro y entre slices, y los contratos nombrados que separan cada borde.

## Decisión

### 3.1 — Contratos inter-capa con DTOs

Tres contratos nombrados, cada uno con su forma TS concreta y dónde vive.

**Borde HTTP (request / response): schema DTO zod.**
- Definido en `<feature>.schemas.ts` con `z` de `@hono/zod-openapi`.
- Una sola fuente de verdad: el mismo schema valida el input crudo, es el contrato OpenAPI, y emite el tipo TS.
- El tipo TS se exporta con `z.infer` desde el MISMO archivo:
  `export type CreateContactRequest = z.infer<typeof CreateContactBodySchema>` (ídem para responses/views).

**Input del use-case: `interface XxxInput` TS puro, co-locado.**
- Vive en el archivo del use-case (`use-cases/<entity>-<acción>.use-case.ts`).
- Es un `interface` plano: SIN zod, SIN Hono, SIN imports de DTOs HTTP.
- Mantiene al use-case libre de presentación → preserva `layers-and-dependencies.md` regla #2.

**Dependencias del use-case: en el constructor de la class.**
- El use-case es una `class <Entity><Acción>UseCase` y recibe sus dependencias por constructor (típicamente `repo: <Entity>Repository`; abierto a `clock`, `idGenerator`, `logger`, etc.).
- Se elimina la interface separada `XxxDeps`: las deps se declaran como parámetros del constructor con visibilidad `private readonly`. Esto centraliza el wiring en un único punto (la instanciación, hecha por `infrastructure/bootstrap.ts` del slice — ver `layers-and-dependencies.md` regla #7).

**Firma estándar del use-case:**
```
export class <Entity><Acción>UseCase {
  constructor(private readonly repo: <Entity>Repository /*, otras deps */) {}
  async execute(input: <Acción><Entity>Input): Promise<...> { ... }
}
```
Input es el contrato semántico (parámetro de `execute`); deps son los servicios (parámetros del constructor). Separados a propósito.

**Salida del use-case: la entidad de dominio.**
- El use-case devuelve la entidad (`Contact`) o una colección (`Page<Contact>`).
- El controller mapea entidad → response schema DTO leyendo getters (patrón `toContactView`).
- La entidad NO cruza el borde HTTP — solo el response DTO se serializa.

**Flujo del controller (presentación):**
1. Validar el request body/query con el schema zod (`c.req.valid(...)`).
2. Construir el `XxxInput` mapeando del request DTO (incluye derivar `userId`/`createdBy` desde la sesión vía `c.get('userId')`).
3. Invocar `this.ucs.<acción>.execute(input)` — el controller recibe las instancias ya construidas vía constructor (`constructor(ucs: <Entity>UseCases)`); el wiring lo hace `infrastructure/bootstrap.ts` del slice.
4. Mapear la entidad devuelta al response schema DTO y devolverla con `c.json(view, status)`.

> La asimetría input-interface vs output-entidad es deliberada. El input DTO existe para neutralizar un acoplamiento real (sin él, el use-case dependería de zod/presentación). En la salida ese riesgo no existe — la entidad sale de la aplicación y la presentación la consume legítimamente (dirección presentación → aplicación → dominio, no al revés).

**Closed types del dominio en los DTOs zod.** Los DTOs zod del borde HTTP (`<entity>-<acción>.in.ts`, `<entity>-<concepto>.out.ts`) NO importan los closed types del dominio (`PipelineState`, `EventType`, etc. de `domain/types/`). Cada DTO redeclara su `z.enum([...])` con los valores válidos. Razón: el DTO es contrato del **WIRE**, independiente del dominio interno. Que dominio y wire evolucionen separados es una FEATURE de aislamiento — agregar un valor de dominio no debe filtrarse automáticamente al OpenAPI/clients (exposición opt-in), ni renombrar internamente debe romper backwards-compat de la API. La "drift bomb" potencial se mitiga con disciplina en PR review, no con acoplamiento. La cruiser rule #3 permite técnicamente `http → domain`, pero esta convención prohíbe ese import para preservar la independencia de la API pública.

**Borde de MÓDULO (cross-slice).** La misma filosofía DTO-no-entidad aplica entre slices, pero la colaboración es **lectura directa del consumidor**, no un contrato publicado por el proveedor. Cuando un slice necesita datos de otro, define un read-port propio (`application/<x>.query.ts`) con read models planos (solo los campos que usa) y un adapter (`infrastructure/<x>.query.drizzle.ts`) que los lee del schema compartido `@shared/db`. Cruzan read models, NUNCA la entidad de dominio de otro slice. La mecánica completa y los límites (solo lecturas; el gate queda ciego al acoplamiento vía shared schema) están en `layers-and-dependencies.md` → "Colaboración cross-slice (lectura directa por read-port del consumidor)".

### 3.2 — Comunicación / side-effects  *(Accepted + sub-Pending)*

**Accepted:** comunicación síncrona directa; la coordinación cross-slice se orquesta en el composition root (coherente con regla #5 de `layers-and-dependencies.md`).

> **Sub-decisión Pending — eventos de dominio in-process.**
> Status: Pending. Trigger: *cuando la orquestación cross-slice en el composition root se vuelva un nudo (varios side-effects colgando de una operación)*. No se cierra la puerta con un "nunca"; se reevalúa cuando aparezca la necesidad real.

### 3.3 — Dónde vive el port del repo

**En `domain/` (hexagonal-pure).** El port (`<entity>.repository.ts` dentro de `domain/`) ES el contrato del dominio con la persistencia: declara la interface abstracta que el dominio necesita, no su implementación. El dominio sigue sin conocer persistencia porque NO hay implementación en `domain/` — solo la interface (un tipo). El adapter (`<entity>.repository.bun.ts`) vive en `infrastructure/` e implementa el port. El use-case importa el port desde `domain/` por sus `Deps` (ver §3.1).

> Esto FLIPEA la decisión original (2026-05-17 hasta 2026-05-20: "nivel application del slice"). Motivo del flip: cuando se reorganizó el slice a carpetas por capa (`layers-and-dependencies.md`, reversión 2026-05-20), poner el port en `application/` separaba el contrato del dominio que lo declara. La interpretación hexagonal-pure (port = parte del dominio) es más coherente con la estructura por capa elegida. Trade-off: el port puede importar `shared/types` (para `Page<T>`), lo que requirió la sub-regla `adr02-1b-port-contract` en `layers-and-dependencies.md`.

### 3.4 — Validación

**En ambos (defensa en profundidad).**
- **Borde:** `zod` valida forma y tipos del input crudo (¿es string?, ¿vino el campo?). Ver `tech/zod.md`.
- **Dominio:** invariantes de negocio en constructores / value objects (formato de Email, amount no negativo, etc.). Una entidad inválida debe ser imposible de construir.
- No mezclar responsabilidades: reglas de negocio NO van en el schema zod.

## Alternativas consideradas

- **3.1: "Entidades pueden cruzar el borde HTTP"** — descartado, ataría el contrato de API al modelo interno.
- **3.1: "Tipo TS a mano + zod aparte" para request/response** — descartado: duplica forma y abre drift; `z.infer` da una sola fuente sin coste extra de tipado.
- **3.1: "Use-case input como `z.infer` del schema zod"** — descartado: viola `layers-and-dependencies.md` regla #2 (use-case dependería de presentación + zod) y rompe la reusabilidad del use-case fuera de HTTP.
- **3.1: "Output DTO simétrico en el use-case"** (opción B) — descartado HOY por YAGNI: añade una capa de mapeo extra sin beneficio mientras HTTP sea el único consumidor. **Trigger para reevaluar:** múltiples consumidores del use-case (worker, CLI, otro bounded context) o necesidad de que la aplicación sea un contrato duro independiente de refactors del dominio.
- **3.2: "Sin eventos nunca"** — descartado por absoluto; **"message bus externo"** — sobredimensionado para greenfield solo.
- **3.4: "Solo borde" / "solo dominio"** — descartados, menos robustos que defensa en profundidad.

## Consecuencias

**Positivas:** contrato de API estable; dominio puro y testeable; use-cases reusables fuera de HTTP; validación robusta.

**Negativas / trade-offs:** mapeo input/output explícito (más código); coordinación cross-slice manual hasta que se resuelva el Pending de §3.2.

## Reglas concretas

- **Borde (entrada):** schema zod en `http/dto/in/<entity>-<acción>.in.ts` → validación con `c.req.valid(...)` en el controller.
- **Tipos de borde:** `export type XxxRequest = z.infer<typeof XxxBodySchema>` en `dto/in/`; `export type XxxView = z.infer<typeof XxxViewSchema>` en `dto/out/`. Una sola fuente por archivo.
- **Use-case:** `interface XxxInput` + `class <Entity><Acción>UseCase` exportados en `application/use-cases/<entity>-<acción>.use-case.ts`. **PROHIBIDO** importar `zod`, `@hono/*` o DTOs HTTP desde un use-case (refuerza `layers-and-dependencies.md` regla #2).
- **Firma del use-case:** la class tiene `constructor(...deps)` para las dependencias y un método `async execute(input: XxxInput): Promise<...>` para la operación. El input NO incluye dependencias; las deps NO incluyen datos del input. Una sola operación por class (un solo `execute`).
- **Salida:** `execute` devuelve entidad de dominio o `Page<Entidad>`. El controller mapea a un view-model que matchea el response schema DTO. La entidad NO se serializa directo a JSON.
- **Controller:** `class <Entity>Controller` con un método handler por ruta; recibe las instancias de use-case por constructor (`constructor(ucs: <Entity>UseCases)`). El wiring de las instancias lo hace `infrastructure/bootstrap.ts` del slice.
- **Cross-slice:** nunca import directo entre `src/modules/A` y `src/modules/B` (sin excepción). Si A necesita datos de B, A define un read-port propio (`application/*.query.ts` + adapter `infrastructure/*.query.drizzle.ts`) que lee el schema compartido `@shared/db`; el `bootstrap.ts` de A lo instancia con `db`.
