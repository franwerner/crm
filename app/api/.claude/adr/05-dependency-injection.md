# ADR 05 — Inyección de dependencias

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 5.1

## Contexto

Hono NO provee DI. Algo tiene que cablear el adapter concreto (`*.repository.bun.ts`) dentro del use-case. Es un solo dev en greenfield.

## Decisión

**Inyección manual en el composition root (`src/app.ts`).** Factories a mano: `app.ts` instancia adapters concretos y los pasa a los use-cases / construye los slices. Sin librería de container. Coherente con la regla #7 del ADR 02 (`app.ts` es el único que cablea concreto).

## Alternativas consideradas

- **Container (awilix):** útil con muchos módulos y wiring complejo; suma una dependencia y ceremonia que no paga a esta escala.
- **Container (tsyringe):** requiere decorators + reflect-metadata; menos afín al setup minimalista de Hono.
- **Framework-provided:** N/A — Hono no tiene DI.

## Consecuencias

**Positivas:** cero magia, cero dependencia extra, fácil de seguir y de testear (cuando se introduzcan tests).

**Negativas / trade-offs:** el wiring manual crece con la cantidad de slices; reevaluar un container si `app.ts` se vuelve inmanejable (no se fija trigger formal, queda a criterio).

## Reglas concretas

- Toda construcción de adapters concretos y wiring vive en `src/app.ts` (composition root).
- Los use-cases reciben sus dependencias por parámetro/constructor (interfaces), nunca las instancian.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Decisión inicial | ifran |
