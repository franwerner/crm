# pino

- **Categoría:** Logging
- **Versión:** ^10.3.1 (+ pino-pretty ^13.1.3 en dev)
- **Status:** Accepted
- **Decidido en fase:** logging (Fase 0 infra async)
- **Fecha:** 2026-06-16

## Por qué la elegimos

Logger JSON estructurado de bajo overhead detrás de la interface `Logger` de `src/shared/logger` (`../observability/logging.md`). dev: pino-pretty; prod: JSON stdout; rotación por Docker log driver.

## Alternativas descartadas

- **winston:** más pesado, menos performante en JSON estructurado.
- **logger nativo de Bun:** menos maduro y menor ecosistema (transports, pretty-printing).
- **hono/logger y pino-http:** no integran con la interface Logger ni el reqId child (se usa middleware propio).

## Notas

Único archivo que lo importa: `logger.pino.ts`. application loggea solo vía la interface, nunca pino directo.
