# ADR — Integración externa: port LLMProvider

- **Status:** Accepted
- **Fecha de creación:** 2026-06-17
- **Última actualización:** 2026-06-17
- **Decisores:** ifran
- **Fase:** Fase 2 — Enriquecimiento LLM

> Este ADR **activa el dominio `integration`**, que el INDEX raíz marcaba "sin uso". El enriquecimiento LLM es el **primer borde de integración con un sistema externo** del proyecto.

> **Revisión 2026-06-17 — contrato simplificado.** Se eliminó `LLMRateLimitError` e `isLLMRateLimitError` del port: ya no existe mapeo de 429 tipado porque el CRM no rota modelos (ver `../runtime/llm-resilience.md`). El adapter deja que los errores del SDK se propaguen tal cual; el use-case los captura como `Error` genérico para persistir el mensaje. El gateway es responsable de elegir y rotar el modelo; el CRM pasa un slug de gateway (no una lista de modelos).

## Contexto

El módulo `enrichment` llama a un LLM externo (OpenRouter, `../tech/openrouter.md`) para generar insights de contactos. Es la primera vez que el proyecto cruza un borde hacia un sistema externo no controlado: red, latencia, errores transitorios, rate limits, secretos. Hay que definir el contrato de ese borde respetando `../structure/inter-layer-communication.md` (§3.3: port en `domain/`), `../security/secrets-management.md` (API key) y `../runtime/error-handling.md` (jerarquía de errores).

## Decisión

**Borde de integración detrás de un port `LLMProvider` (Ports & Adapters), con el contrato en `domain/` y el adapter concreto en infraestructura.**

**Contrato del port** (`enrichment/domain/llm-provider.ts`):

```ts
interface LLMCompletion {
  content: string;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
}

interface LLMProvider {
  complete(p: {
    systemPrompt: string;
    userContent: string;
    model: string;  // gateway slug, e.g. 'openrouter/free'
  }): Promise<LLMCompletion>;
}
```

- **`model` es un gateway slug:** el CRM pasa el slug configurado (`OPENROUTER_MODEL`); el gateway (OpenRouter o futuro servicio propio) decide qué modelo concreto atiende el request.
- **`modelUsed` explícito:** el adapter devuelve el modelo concreto que el gateway reportó haber usado, para trazabilidad en el insight.
- **Sin error tipado de rate-limit:** el adapter ya no mapea 429 a `LLMRateLimitError`; los errores del SDK se propagan como `Error` estándar. El use-case captura `.message` para `recordError` y rethrow — BullMQ reintenta. La gestión de rate-limit es responsabilidad del gateway.
- **Adapter:** `enrichment/infrastructure/openrouter-llm-provider.ts` — único lugar que toca el SDK `openai`/OpenRouter. El use-case depende SOLO de la interface.
- **Secretos:** la API key (`OPENROUTER_API_KEY`) se aprovisiona como env var y se consume vía config tipada, NUNCA leída cruda — según `../security/secrets-management.md`. Nunca se loguea ni se serializa en una respuesta de error.
- **Timeout:** la llamada externa tiene timeout configurado (no espera indefinida); un timeout es un error transitorio que se delega al retry de BullMQ.

## Reglas concretas (verificables)

- domain/application NUNCA importan el SDK `openai` ni hacen `fetch` directo a OpenRouter: dependen del port `LLMProvider`. Solo el adapter de infra toca el SDK.
- El port vive en `domain/` (no en application), por `../structure/inter-layer-communication.md` §3.3.
- No existe `LLMRateLimitError` en el contrato del port — errores del gateway se propagan como `Error` y son manejados por BullMQ retry.
- La API key se consume vía config tipada; prohibido leer `Bun.env`/`process.env` para obtenerla.
- El parámetro `model` es el slug del gateway, no un identificador de modelo concreto.

## Alternativas consideradas

- **Pasar el SDK OpenAI crudo al use-case** — acopla la application al SDK externo; se rechaza por el port. Descartado.
- **Mantener error tipado `LLMRateLimitError`** — era necesario cuando el CRM rotaba modelos internamente. Con la rotación delegada al gateway, ese contrato ya no tiene consumidor en application. Descartado (ver revisión histórica abajo).

## Consecuencias

**Positivas:** la lógica de enriquecimiento es agnóstica del proveedor LLM (testeable con un fake del port); el borde externo está aislado en un solo adapter; el contrato del port es más simple (sin tipos de error especializados); el CRM puede cambiar de gateway editando solo el adapter y la env var `OPENROUTER_MODEL`.

**Negativas / trade-offs:** al no tipar el rate-limit, el use-case no puede distinguir un 429 de un error de red — ambos se delegan al mismo retry de BullMQ. Si en el futuro se necesita diferenciar (p. ej. para DLQ selectivo), habría que re-introducir un tipo de error especializado en el port.

---

## Traza histórica — contrato original (revisión inicial, supersedida)

> El contrato original incluía `LLMRateLimitError { kind: 'rate_limit'; model: string; retryAfterSec: number | null }` e `isLLMRateLimitError()`. El adapter mapeaba los 429 del SDK a ese tipo; el use-case lo interpretaba para aplicar la política burst RPM / rotate descrita en `../runtime/llm-resilience.md` (primera versión). Ese contrato se eliminó al delegar la rotación al gateway (revisión 2026-06-17).
