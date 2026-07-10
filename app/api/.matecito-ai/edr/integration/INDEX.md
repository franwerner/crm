# Dominio: `integration` — Decisiones

Bordes de integración con sistemas externos: contratos de puerto hacia APIs/servicios de terceros, credenciales de la integración, timeouts y mapeo de errores externos a la jerarquía interna.

## EDRs en este dominio

| EDR | Status | Type | Consultá cuando... |
|---|---|---|---|
| [llm-provider.md](llm-provider.md) | Accepted | decision | Toques el adapter LLM, el contrato del port `LLMProvider`, el manejo de errores del gateway o la API key de OpenRouter. En general: llames a un sistema externo, definas o toques un adapter de integración, o manejes errores/secretos de un borde externo. |

> La resiliencia y rotación de modelos de esta integración viven en [`../runtime/llm-resilience.md`](../runtime/llm-resilience.md); la elección del SDK/gateway y los modelos en [`../tech/openrouter.md`](../tech/openrouter.md).

**Leyenda de status:** `Accepted` · `Pending` · `Not Applicable` · `Deferred` · `Superseded`.
