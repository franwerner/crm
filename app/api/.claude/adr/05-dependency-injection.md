# ADR 05 — Inyección de dependencias

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-26 (se elimina la conexión de `publicApi` cross-slice: cada bootstrap cablea su propio read-port con `db`)
- **Decisores:** ifran
- **Fase del bootstrap:** 5.1

## Contexto

Hono NO provee DI. Algo tiene que cablear el adapter concreto (`*.repository.bun.ts`) dentro del use-case. Es un solo dev en greenfield.

## Decisión

**Inyección manual en un composition root DISTRIBUIDO.** Sin librería de container. El wiring se reparte así:

- **Por slice — `src/modules/<m>/infrastructure/bootstrap.ts`.** Es el mini composition-root del módulo. Instancia los adapters concretos del slice (repo `*.repository.bun.ts` y read-ports `*.query.drizzle.ts`, incluidos los que leen datos de otro módulo del schema compartido), los use-cases (pasándoles sus dependencias por constructor), el controller (pasándole el objeto con las instancias de use-case) y el router (pasándole el controller). Retorna `{ router }`. Es el ÚNICO archivo del slice (junto con `src/app.ts`) que importa `*.repository.bun.ts` y `*.query.drizzle.ts` de SU PROPIO módulo.
- **Global — `src/app.ts`.** Es el orquestador: llama a cada `bootstrap*` (pasándoles `db` u otra dep de borde) y monta los routers retornados. Ya NO conecta `publicApi` entre slices: cada slice resuelve sus lecturas cross-módulo con su propio read-port sobre el schema compartido.

Coherente con la regla #7 reescrita del ADR 02. Cada slice queda autocontenido: agregar un use-case nuevo se resuelve dentro del bootstrap del slice, sin tocar `app.ts`.

## Alternativas consideradas

- **Container (awilix):** útil con muchos módulos y wiring complejo; suma una dependencia y ceremonia que no paga a esta escala.
- **Container (tsyringe):** requiere decorators + reflect-metadata; menos afín al setup minimalista de Hono.
- **Framework-provided:** N/A — Hono no tiene DI.

## Consecuencias

**Positivas:** cero magia, cero dependencia extra, fácil de seguir y de testear (cuando se introduzcan tests). Cada slice es autocontenido: el bootstrap del módulo encapsula su wiring; `app.ts` no crece con la cantidad de use-cases del slice — sólo con la cantidad de slices.

**Negativas / trade-offs:** ahora hay dos lugares donde mirar al introducir un use-case nuevo (el archivo del use-case y el `bootstrap.ts` del slice); a cambio el wiring del módulo queda localizado y no se desparrama en `app.ts`. Reevaluar un container si `app.ts` o los `bootstrap.ts` se vuelven inmanejables (no se fija trigger formal, queda a criterio).

## Reglas concretas

- Toda construcción de adapters concretos del slice y wiring de SUS use-cases/controllers vive en `src/modules/<m>/infrastructure/bootstrap.ts`. Si un slice no tiene repo propio (ej. `auth`), igual existe `infrastructure/bootstrap.ts` — es la única razón por la que se permite la carpeta `infrastructure/` sin adapter.
- `src/app.ts` instancia las deps de borde (`db`), llama a cada `bootstrap*` y monta los routers. NO instancia use-cases ni adapters directamente, ni conecta `publicApi` entre slices.
- Los use-cases reciben sus dependencias por constructor (`private readonly`); el método público es `execute(input)`. Nunca instancian sus dependencias.
- Los controllers reciben las instancias de use-case por constructor (`constructor(ucs: <Entity>UseCases)`). Nunca instancian use-cases.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
| 2026-05-20 | **Composition root distribuido.** El wiring se mueve de un único `src/app.ts` a un esquema (a) `src/modules/<m>/infrastructure/bootstrap.ts` por slice — mini composition-root autocontenido que retorna `{ router, publicApi? }` —, (b) `src/app.ts` orquesta llamando a los `bootstrap*`, conectando `publicApi` cross-slice y montando los routers. Motivo: autocontención del módulo (use-cases nuevos no obligan a tocar `app.ts`) y coherencia con el refactor a class de use-cases/controllers (ADR 03 §3.1, ADR 02 regla #3). `.dependency-cruiser.js`: rules 4 y 7 actualizadas para reconocer `infrastructure/bootstrap.ts` como punto de wiring del slice. Aplicado a contacts, users y auth. | ifran |
| 2026-05-26 | **Se elimina la conexión de `publicApi` cross-slice.** Al revertirse el patrón de API pública (ADR 02, Historial 2026-05-26), los `bootstrap*` ya no retornan `publicApi` ni `app.ts` la pasa de un slice a otro. Cada slice cablea sus lecturas cross-módulo con su propio read-port (`*.query.drizzle.ts`) instanciado con `db` dentro de su `bootstrap.ts`; `app.ts` solo pasa `db` y monta routers. El bootstrap deja de importar `*.public.impl.ts`. Migración incremental: arranca por auth. | ifran |
