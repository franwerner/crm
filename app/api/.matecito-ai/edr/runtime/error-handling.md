# EDR — Manejo de errores

- **Status:** Accepted
- **Type:** policy
- **Date:** 2026-05-17

## Contexto

Una API que falla distinto en cada endpoint es una API en la que nadie confía. Un CRM maneja PII por todos lados (emails, teléfonos, notas de clientes), así que el error tampoco puede filtrar datos sensibles.

## Decisión

**Estilo:** excepciones + jerarquía de errores de dominio tipados. Un `throw` corta el flujo; un único handler global lo captura y lo traduce. Prohibido el try/catch por endpoint para mapear errores (anti-patrón: dispersa el mapeo).

**Jerarquía de dominio:** una clase base de error de dominio con subtipos semánticos (no-encontrado, conflicto, regla de negocio, validación, no autorizado). El handler global mapea por tipo, no por parsing de strings.

**Formato de respuesta (contrato público):** RFC 7807 Problem Details (`application/problem+json`) con `title`, `status`, `detail`, `instance` + `code` como extension field. Se omite `type` (RFC 7807 lo define opcional con default `about:blank`); el discriminador programático del cliente es `code`, no `type`. Extensible con un array `errors` de campo para que el cliente pinte fallos de validación.

**`code` por tipo de error** (flat snake_case, estilo Stripe/GitHub) — contrato expuesto al consumidor:

| Error | `code` | Status |
|---|---|---|
| no-encontrado | `not_found` | 404 |
| conflicto | `conflict` | 409 |
| regla de negocio | `business_rule` | 422 |
| validación (incluye fallos de schema en el borde) | `validation_failed` | 400 |
| no autorizado | `unauthorized` | 401 |
| fallback inesperado (no es error de dominio ni de validación) | `internal_error` | 500 |

> Convención: flat snake_case. Una migración futura a hierarchical (ej. `contacts.not_found`) sería solo cambio de string en cada subtipo y en sus call-sites. Hoy se mantiene flat por simplicidad.

**Política de logging de errores:**

| Qué | Regla |
|---|---|
| 5xx (inesperado) | nivel `error`, con stack y un id correlacionable (request-id / errorId) |
| 4xx / dominio esperado | nivel `warn` (o `info`), sin stack — flujo normal |
| NUNCA se loguea | passwords, tokens, API keys, cookies, payloads/bodies completos, PII de clientes (email, teléfono, notas) |
| Correlación | cada error lleva un id correlacionable para rastrear sin exponer datos |

## Alcance

- `src/shared/errors/**` — jerarquía de errores de dominio (clase base + subtipos semánticos).

## Reglas verificables

- **[manual]** Todo error de negocio extiende la clase base de error de dominio (en `src/shared/errors/`).
- **[manual]** Cada subtipo declara su `code` (flat snake_case) como `readonly`; no se usa `type`.
- **[manual]** Un único handler global de errores traduce error → HTTP (`application/problem+json`); ningún endpoint hace try/catch para mapear errores.
- **[manual]** El body del Problem incluye `code` como discriminador programático; el cliente nunca se basa en parsear `title`/`detail`.
- **[manual]** Nunca se loguean credenciales, tokens, cookies, bodies completos ni PII de clientes.

## Alternativas consideradas

- **Result/Either en todo:** ceremonia alta sin `Either` nativo en TS; más fricción de DX.
- **try/catch por handler:** mapeo inconsistente, anti-patrón.
- **Formato de error custom:** reinventa un estándar existente.

## Consecuencias

**Positivas:** errores consistentes; un solo punto de traducción; formato estándar interoperable; PII protegida.

**Negativas / trade-offs:** la política de logging queda inerte hasta que exista infraestructura de logging (ver Relacionados).

## Relacionados

- `depende-de` → [../observability/logging.md](../observability/logging.md) — la política de logging de errores es un contrato vigente pero inerte: se vuelve obligatoria en cuanto ese EDR pase a Accepted (cuando se introduzca logging). Hasta entonces no hay infraestructura que la materialice.
