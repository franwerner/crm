# ADR — Inyección de dependencias (app/ui)

- **Status:** Not Applicable
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** dependency-injection

## Contexto

El subtema de DI del bootstrap está pensado para backends con composition root e inyección de servicios.

## Razón de omisión / aplazamiento

**Status:** Not Applicable

En una SPA React la "inyección de dependencias" se resuelve con el modelo de composición propio del framework: providers de Context (QueryClientProvider, auth, router) montados en `src/app/`, y hooks que se consumen donde se necesitan. No hay un container de DI ni necesidad de uno. Introducir un framework de Dic sería ceremonia sin valor para este stack.

- Lo más cercano a "composition root" es `src/app/` (providers + router + guards), ya cubierto por el `layers-and-dependencies.md` (regla #7) y el `auth.md`.

## Alternativas consideradas

- Container de DI (inversify, tsyringe) — no aplica al modelo de React; descartado.

## Consecuencias

N/A — la composición vía providers/hooks es suficiente y idiomática.

## Reglas concretas

- Providers globales se montan en `src/app/`. No introducir un container de DI sin reabrir este ADR.
