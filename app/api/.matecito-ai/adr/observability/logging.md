# ADR — Logging

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-06-16 (resuelto: pino + interface Logger; trigger alcanzado en Fase 0 infra async)
- **Decisores:** ifran
- **Fase:** logging

## Contexto

`../runtime/error-handling.md` §4.5 definió la política de logging de errores (5xx con stack, scrubbing de PII, correlación por request-id). La Fase 0 de infraestructura asíncrona introduce un worker y procesos de larga vida que requieren observabilidad: se alcanza el trigger ("dejar de ser prototipo local").

## Decisión

**`pino` detrás de una interface `Logger` en `src/shared/logger`.**

- `interface Logger` (`logger.ts`): métodos `trace/debug/info/warn/error/fatal(obj | msg, msg?)` y `child(bindings): Logger`. Es el único contrato que ve application.
- Impl `logger.pino.ts` (único archivo que importa pino). Inyectada en el composition root (`app.ts` para API, `worker.ts` para el worker).
- **Formato por entorno:** `development` → `pino-pretty`; `production` → JSON a stdout. Nivel por `LOG_LEVEL` (default `info` prod / `debug` dev).
- **Rotación:** delegada al Docker log driver (json-file con max-size/max-file). La app NUNCA escribe logs a archivos.
- **Request logging:** middleware propio para Hono (`shared/http/request-logger.ts`) que genera/propaga `reqId` y crea un child logger (`logger.child({ reqId })`); los logs del request incluyen `reqId`.
- **Aplica §4.5 de error-handling:** al pasar a Accepted, el scrubbing de PII y el logging de 5xx con stack pasan a ser obligatorios.

## Reglas concretas (verificables)

- domain NUNCA importa ni invoca el Logger (lanza errores). application loggea SOLO vía la interface `Logger` inyectada por constructor, nunca pino directo. infrastructure y http MAY loggear.
- Prohibido `console.log` para logging operacional fuera del fail-fast de startup.
- Prohibido usar `hono/logger` built-in y `pino-http`: el request logging es el middleware propio.
- El nivel se controla solo por `LOG_LEVEL`; no hardcodear niveles.

## Alternativas consideradas

- `hono/logger` built-in / `pino-http` — descartados: no integran con la interface Logger ni el reqId child; menos control de formato.
- winston / logger nativo de Bun — pino gana en performance (JSON estructurado de bajo overhead) y ecosistema (pino-pretty, transports).
- Texto plano — descartado para una API/worker reales.

## Consecuencias

**Positivas:** trazabilidad operacional; correlación por reqId; §4.5 activa; domain puro.
**Negativas:** una dependencia más (pino/pino-pretty); disciplina para no loggear desde domain (no enforzable por cruiser — globals).
