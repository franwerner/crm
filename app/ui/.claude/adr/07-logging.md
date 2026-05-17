# ADR 07 — Logging (app/ui)

- **Status:** Not Applicable
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase del bootstrap:** 5.3

## Contexto

El subtema "logging" del bootstrap, en un frontend, se traduce a observabilidad de errores del cliente.

## Razón de omisión / aplazamiento

**Status:** Not Applicable (cubierto por otro ADR)

En una SPA no hay "logging" de servidor. El equivalente —observabilidad de errores del cliente / error tracker— ya está tratado en **ADR 04 §4.3**, donde quedó como `Pending` con su trigger. No se duplica la decisión acá.

- Ver `04-error-handling.md` §4.3 para el estado real y el trigger de reevaluación.

## Alternativas consideradas

N/A — decisión re-dirigida a ADR 04 §4.3 para evitar doble registro.

## Consecuencias

N/A — sin doble fuente de verdad: la observabilidad de cliente se gobierna desde ADR 04.

## Reglas concretas

- Para cualquier tema de observabilidad/error tracking de cliente, consultar `04-error-handling.md` §4.3.

## Historial

| Fecha | Cambio | Por |
|---|---|---|
| 2026-05-17 | Marcado Not Applicable — observabilidad de cliente cubierta por ADR 04 §4.3 (Pending allá) | ifran |
