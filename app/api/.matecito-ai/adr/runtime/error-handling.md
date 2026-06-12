# ADR — Manejo de errores

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-20 (§4.4 reescrita: eliminado campo `type`; agregado `code` como discriminador flat snake_case)
- **Decisores:** ifran
- **Fase:** error-handling

## Contexto

Una API que falla distinto en cada endpoint es una API en la que nadie confía. Un CRM tiene PII por todos lados (emails, teléfonos, notas de clientes).

## Decisión

### 4.1 — Estilo
**Excepciones** + jerarquía de errores de dominio tipados. `throw` corta el flujo; un handler global lo captura.

### 4.2 — Boundary handling
**Handler global único** vía `app.onError` de Hono. Mapea la jerarquía de errores de dominio → status + body. Prohibido try/catch por endpoint para mapear errores (anti-patrón).

### 4.3 — Errores de dominio custom
**Jerarquía completa con clase base** en `src/shared/errors/`: `DomainError` base + subtipos semánticos (`NotFoundError`, `ConflictError`, `BusinessRuleError`, `ValidationError`, ...). El `onError` mapea por tipo, no por parsing de strings.

### 4.4 — Formato de respuesta
**RFC 7807 Problem Details** (`application/problem+json`): `title`, `status`, `detail`, `instance` + **`code`** como extension field. Se OMITE `type` (RFC 7807 lo define opcional con default `about:blank`); el discriminador programático del cliente es `code`, NO `type`. Extensible con un array `errors` de campo (para que `app/ui` pinte validaciones de zod).

**`code` por tipo de error** (flat snake_case, estilo Stripe/GitHub):

| Error | `code` | Status |
|---|---|---|
| `NotFoundError` | `not_found` | 404 |
| `ConflictError` | `conflict` | 409 |
| `BusinessRuleError` | `business_rule` | 422 |
| `ValidationError` (incluye fallos de zod en el borde) | `validation_failed` | 400 |
| `UnauthorizedError` | `unauthorized` | 401 |
| Fallback inesperado (no `DomainError`, no `ZodError`) | `internal_error` | 500 |

> Convención: flat snake_case. Migración futura a hierarchical (ej. `'contacts.not_found'`) sería solo cambio de string en cada subclase y en los call-sites de los `throw`. Hoy se mantiene flat por simplicidad.

### 4.5 — Política de logging de errores
| Qué | Regla |
|---|---|
| 5xx (inesperado) | nivel `error`, con stack y un `errorId`/`request-id` correlacionable |
| 4xx / dominio esperado | nivel `warn` (o `info`), sin stack — flujo normal |
| NUNCA se loguea | passwords, tokens, API keys, cookies, payloads/bodies completos, PII de clientes (email, teléfono, notas) |
| Correlación | cada error lleva `request-id`/`errorId` para rastrear sin exponer datos |

> **Dependencia con `../observability/logging.md` (Pending):** esta política es un **contrato vigente y obligatorio desde el momento en que `../observability/logging.md` pase a `Accepted`** (cuando se introduzca logging). Mientras esté Pending, la política existe como contrato pero no hay infraestructura que la materialice. No asumir que ya está activa.

## Alternativas consideradas

- 4.1: Result/Either en todo — ceremonia alta sin Either nativo en TS. Mix — más fricción de DX.
- 4.2: try/catch por handler — mapeo inconsistente, anti-patrón.
- 4.4: Formato custom JSON — reinventa un estándar existente.

## Consecuencias

**Positivas:** errores consistentes; un solo punto de traducción; formato estándar interoperable; PII protegida.

**Negativas / trade-offs:** la política de logging queda inerte hasta resolver `../observability/logging.md`.

## Reglas concretas

- Todo error de negocio extiende `DomainError` (en `src/shared/errors/`).
- Cada subclase de `DomainError` declara su `code` (flat snake_case) como `readonly`. NO usar `type`.
- `app.onError` es el único lugar que traduce error → HTTP (`application/problem+json`).
- El body del Problem incluye `code` como discriminador programático; el cliente NUNCA se basa en parseo de `title` o `detail`.
- Nunca loguear credenciales, tokens, bodies completos ni PII de clientes.
