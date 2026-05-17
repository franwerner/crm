# ADR 05 — Inyección de dependencias (app/ui)

- **Status:** Not Applicable
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 5.1

## Contexto

El subtema de DI del bootstrap está pensado para backends con composition root e inyección de servicios.

## Razón de omisión / aplazamiento

**Status:** Not Applicable

En una SPA React la "inyección de dependencias" se resuelve con el modelo de composición propio del framework: providers de Context (QueryClientProvider, auth, router) montados en `src/app/`, y hooks que se consumen donde se necesitan. No hay un container de DI ni necesidad de uno. Introducir un framework de Dic sería ceremonia sin valor para este stack.

- Lo más cercano a "composition root" es `src/app/` (providers + router + guards), ya cubierto por el ADR 02 (regla #7) y el ADR 10.

## Alternativas consideradas

- Container de DI (inversify, tsyringe) — no aplica al modelo de React; descartado.

## Consecuencias

N/A — la composición vía providers/hooks es suficiente y idiomática.

## Reglas concretas

- Providers globales se montan en `src/app/`. No introducir un container de DI sin reabrir este ADR.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Marcado Not Applicable — composición React (providers/hooks), sin necesidad de DI container | ifran |
