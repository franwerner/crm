# Dominio: integration — Índice

**Criterio de pertenencia:** ADRs sobre los bordes de integración con sistemas externos: contratos de puerto hacia APIs/servicios de terceros, manejo de credenciales de la integración, timeouts y mapeo de errores externos a la jerarquía interna. **Consultá cuando** llames a un sistema externo (API de terceros, gateway, servicio remoto), definas o toques un adapter de integración, o manejes errores/secretos de un borde externo.

| ADR | Status | Tema | Consultá cuando... |
|---|---|---|---|
| [llm-provider.md](llm-provider.md) | Accepted | Port de integración LLM (OpenRouter) | Toques el adapter LLM, el contrato del port `LLMProvider`, el mapeo del 429 tipado o el manejo de la API key de OpenRouter. |

> La resiliencia/rotación de modelos de esta integración (cooldown Redis + retry BullMQ) vive en [`../runtime/llm-resilience.md`](../runtime/llm-resilience.md); la elección del SDK/gateway y los modelos free en [`../tech/openrouter.md`](../tech/openrouter.md).
