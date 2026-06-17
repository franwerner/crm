# ADR — Resiliencia LLM (resiliencia del lado del CRM)

- **Status:** Accepted
- **Fecha de creación:** 2026-06-17
- **Última actualización:** 2026-06-17
- **Decisores:** ifran
- **Fase:** Fase 2 — Enriquecimiento LLM

> Este ADR **mantiene el concern `resilience`** activo en el `runtime/INDEX.md`. El enriquecimiento LLM (OpenRouter) es la **primera dependencia externa** del proyecto que justifica estrategia de resiliencia.

> **Revisión 2026-06-17 — SUPERSEDE de la rotación manual + cooldown Redis.** La rotación/fallback de modelos LLM pasa a ser responsabilidad exclusiva del GATEWAY EXTERNO (hoy OpenRouter `openrouter/free` que rotea internamente; mañana un servicio propio del usuario), del otro lado del port `LLMProvider`. El CRM **NO rota, NO implementa cooldown por modelo**. Se eliminaron `ModelCooldownStore`, `BunRedisModelCooldownStore`, el loop while de rotación 429, la env var `LLM_MODEL_COOLDOWN_TTL_MS` y la env var `OPENROUTER_MODELS` (CSV). La decisión original de rotación manual se preserva en la sección de revisión al pie de este archivo como traza histórica.

## Contexto

El módulo `enrichment` consume modelos LLM a través de OpenRouter en el tier **gratuito**. Los modelos free tienen límites estrictos de rpm/rpd y pueden devolver errores transitorios. Hace falta una estrategia que: (a) no pierda jobs, (b) sea observable en caso de fallo, (c) sea simple de mantener.

## Decisión

**El gateway externo es responsable de la elección, rotación y fallback de modelos. El CRM implementa resiliencia de su lado mediante retry BullMQ + reconciliación + persistencia del lastError.**

**Responsabilidades del gateway (OpenRouter / futuro servicio propio):**
- Elegir qué modelo concreto atiende cada request.
- Rotar entre modelos cuando uno está saturado.
- Absorber los 429 de los modelos free internamente.
- El CRM pasa un identificador de gateway slug (`openrouter/free`) y el gateway resuelve.

**Responsabilidades del CRM:**
- `retry BullMQ`: cada job tiene `attempts = LLM_MAX_ATTEMPTS` con backoff exponencial. Si el gateway devuelve error, BullMQ reintenta automáticamente.
- `recordError`: antes de rethrow, el use-case persiste el mensaje real del error en `insight.lastError` (sin cambiar el status — sigue en `processing`). Cada reintento sobreescribe `lastError` con el motivo más reciente.
- `reconciliación`: `EnrichmentReconcileUseCase` detecta insights `processing` o `queued` colgados (> `ENRICHMENT_PROCESSING_STALE_MS`) y los re-encola. Al marcar `failed` por agotamiento de intentos, preserva el `lastError` real del último reintento.
- Config: un único `OPENROUTER_MODEL` (string, default `openrouter/free`) — el slug del gateway, no una lista de modelos.

**Terminal:** al agotar `LLM_MAX_ATTEMPTS` el job queda en el failed set / DLQ de BullMQ; el insight queda `failed` con `lastError` real persistido (recuperable vía retry in-place).

## Reglas concretas (verificables)

- El CRM NO implementa rotación de modelos ni cooldown por modelo. Esa lógica vive únicamente en el gateway externo.
- `insight.lastError` refleja el mensaje real del error del último intento; el use-case llama `recordError(message, now)` antes de rethrow.
- La reconciliación preserva el `lastError` real al marcar `failed` por intentos agotados: `markFailed(insight.lastError ?? fallback, now)`.
- El único slug de gateway se configura en `OPENROUTER_MODEL` (string único, no CSV).
- El estado durable del insight (`queued`/`processing`/`completed`/`failed`, `attempts`, `lastError`) vive en Postgres, según `background-jobs.md`.

## Alternativas consideradas

- **Rotación manual + cooldown Redis (decisión original):** implementada en la primera versión del módulo enrichment. Añadía `ModelCooldownStore` (Redis) + loop `while(true)` 429 + lógica burst RPM en el use-case. **Descartada en esta revisión** porque: (a) OpenRouter `openrouter/free` ya hace el fallback internamente, (b) duplica responsabilidad con el gateway, (c) añade complejidad y una dependencia Bun.redis en el módulo. La traza completa de esa decisión se preserva en la revisión de 2026-06-17 del ADR original (en git).
- **Solo retry BullMQ sin recordError:** no deja trazabilidad del motivo real por reintento en el DB — descartado, el `lastError` en Postgres es el único observability que tenemos sin logging costoso.
- **Implementar circuit-breaker propio:** añade complejidad; el gateway ya lo absorbe. Descartado.

## Consecuencias

**Positivas:** superficie de código reducida (se eliminaron ~120 líneas + 2 archivos); sin dependencia Bun.redis en el módulo `enrichment` (la única Bun.redis que queda es `BunRedisMxCache` en el checker de canales, según `../tech/redis.md`); lógica de resiliencia claramente separada entre gateway y CRM; `lastError` es siempre el mensaje real del error.

**Negativas / trade-offs:** el CRM cede el control de qué modelo se usa en cada request (ya no elige ni rota); `modelUsed` en el insight refleja lo que el gateway reporta (puede ser un modelo concreto o el alias `openrouter/free`); si el gateway no retorna un 429 explícito sino otro tipo de error, BullMQ igualmente reintenta (comportamiento correcto pero menos informativo que el circuito manual anterior).

---

## Traza histórica — Revisión 2026-06-17 (rotación manual, supersedida)

> La primera implementación de este ADR (mismo archivo, misma fecha de creación) definía:
> - **Circuit-breaker manual via cooldown por modelo en Redis + retry BullMQ como backstop.**
> - `ModelCooldownStore` con keys `cooldown:{model}`, `SET NX EX <ttl>` (atómico entre workers).
> - `OPENROUTER_MODELS` (CSV) como fuente de verdad del orden de rotación.
> - Loop 429 en el use-case: burst RPM (retryAfter < 120s → mismo modelo) / rotate (retryAfter ≥ 120s → next).
> - `LLM_MODEL_COOLDOWN_TTL_MS` como TTL configurable del cooldown.
>
> Esa lógica se eliminó en la segunda revisión del mismo día por las razones documentadas en "Alternativas consideradas" arriba. El historial de código vive en git.
