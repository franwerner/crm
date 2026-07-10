# EDR — Logging

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-17

## Contexto

La política de logging de errores (5xx con stack, scrubbing de PII, correlación por request-id) quedó definida por el manejo de errores del proyecto, pero condicionada a un trigger: dejar de ser un prototipo local. La introducción de un worker y procesos de larga vida (infraestructura asíncrona) alcanza ese trigger: se necesita observabilidad operacional real, no logs ad-hoc.

## Decisión

Usamos `pino` detrás de una interface propia `Logger`, que es el único contrato de logging que ve la capa de aplicación; la implementación concreta es el único punto que toca `pino`, inyectada en el composition root (tanto para la API como para el worker).

- **Formato por entorno:** desarrollo usa salida legible (`pino-pretty`); producción emite JSON a stdout. El nivel se controla por variable de entorno.
- **Rotación:** delegada al log driver del contenedor. La app nunca escribe logs a archivos.
- **Request logging:** un middleware propio genera/propaga un id de request y crea un child logger, de modo que todos los logs de un mismo request quedan correlacionados por ese id.
- **Activa la política de errores:** al pasar a Accepted, el scrubbing de PII y el logging de 5xx con stack pasan a ser obligatorios.

## Alcance

- `src/shared/logger/**` — el contrato `Logger` y su única implementación concreta (el único módulo que importa `pino`).

## Reglas verificables

- **[tool: dependency-cruiser]** solo la implementación concreta del `Logger` importa `pino`; domain y application no importan `pino` ni `pino-http`.
- **[tool: dependency-cruiser]** el request logging es un middleware propio: prohibido importar el logger built-in de `hono` y `pino-http`.
- **[manual]** domain nunca importa ni invoca el `Logger` (lanza errores, no loguea). application loguea solo vía la interface `Logger` inyectada por constructor, nunca `pino` directo; infrastructure y http sí pueden loguear.
- **[manual]** prohibido `console.log` para logging operacional, salvo el fail-fast de startup.
- **[manual]** el nivel se controla solo por la env var `LOG_LEVEL` (default `info` en prod, `debug` en dev); no hardcodear niveles.

## Alternativas consideradas

- **Logger built-in de `hono` / `pino-http`** — descartados: no integran con la interface `Logger` ni con el child logger por request-id; menos control de formato.
- **winston / logger nativo de Bun** — `pino` gana en performance (JSON estructurado de bajo overhead) y ecosistema (`pino-pretty`, transports).
- **Texto plano** — descartado para una API/worker reales.

## Consecuencias

**Positivas:** trazabilidad operacional; correlación por request-id; la política de errores queda activa; domain puro (no loguea).

**Negativas / trade-offs:** una dependencia más (`pino`/`pino-pretty`); la disciplina de no loguear desde domain no es enforzable por herramienta (es una llamada a global, no un import).

## Relacionados

- `depende-de` → [../runtime/error-handling.md](../runtime/error-handling.md) — la política de logging de errores (scrubbing de PII, 5xx con stack, correlación por request-id) que este EDR vuelve obligatoria.
