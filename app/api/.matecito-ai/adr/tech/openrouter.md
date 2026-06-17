# openrouter (vía SDK `openai`)

- **Categoría:** LLM gateway / Cliente de modelos (OpenAI-compatible)
- **Versión:** dep npm `openai` latest / sin pinear · gateway OpenRouter (API OpenAI-compatible)
- **Status:** Accepted
- **Decidido en fase:** Fase 2 — Enriquecimiento LLM
- **Fecha:** 2026-06-17

> **Revisión 2026-06-17:** Se adopta `openrouter/free` (auto-router) como el gateway slug canónico. Se eliminaron la lista `OPENROUTER_MODELS` (CSV), los límites rpm/rpd hardcodeados como constantes, y la lógica de rotación manual. El gateway gestiona internamente la selección y fallback de modelos. Config ahora: `OPENROUTER_MODEL` (string único).

## Por qué la elegimos

El enriquecimiento LLM (módulo `enrichment`) necesita un cliente para hablar con modelos de lenguaje. OpenRouter expone una API **OpenAI-compatible**, así que se usa el SDK npm oficial `openai` configurado con `baseURL=OPENROUTER_BASE_URL` (default `https://openrouter.ai/api/v1`) — drop-in, sin reimplementar el protocolo. El adapter vive detrás del port `LLMProvider` (`../integration/llm-provider.md`); el SDK NO se filtra al use-case.

- SDK maduro, type-safe, mantenido; OpenRouter habla el mismo dialecto OpenAI (`chat.completions`).
- Un solo gateway (OpenRouter) da acceso a múltiples modelos de distintos proveedores bajo una sola API key.
- La API key se aprovisiona como env var (`OPENROUTER_API_KEY`) y se consume vía config tipada, según `../security/secrets-management.md`.

## Gateway slug y selección de modelo

El CRM usa **`openrouter/free`** como gateway slug (`OPENROUTER_MODEL`). Este slug es el auto-router de OpenRouter: enruta cada request al modelo free disponible en ese momento, aplicando su propio fallback/rotación internamente.

- El CRM pasa el slug al adapter; el gateway resuelve qué modelo concreto atiende el request.
- No hay lista de modelos en el CRM, no hay rotación manual, no hay cooldown por modelo del lado del CRM.
- `modelUsed` en el insight refleja el modelo concreto que OpenRouter reportó haber usado — trazabilidad preservada.
- Cambiar de gateway (p. ej. a un servicio propio) = cambiar el adapter y `OPENROUTER_MODEL`, sin tocar el use-case.

## Alternativas descartadas

- **`@openrouter/ai-sdk-provider`:** dependencia extra, atada al ecosistema Vercel AI SDK; menos universal que el SDK `openai`. Descartada.
- **`fetch` crudo contra la API:** habría que reimplementar manejo de streaming/SSE, parseo de errores y tipos de respuesta — reinventar la rueda sin ganancia. Descartado.
- **SDK OpenAI crudo pasado al use-case:** acopla la application al SDK externo; se evita encapsulándolo detrás del port `LLMProvider`. Descartado (ver `../integration/llm-provider.md`).
- **Lista `OPENROUTER_MODELS` + rotación manual (primera versión):** el CRM implementaba selección por cooldown y loop 429 propio. Descartado al delegar esa responsabilidad al gateway (ver `../runtime/llm-resilience.md`).

## Notas

- El SDK `openai` v4+ usa `fetch` nativo; el adapter fuerza `fetch: globalThis.fetch` en el constructor del cliente para garantizar el fetch nativo de Bun (no `node:http`). Validado empíricamente.
- `response_format: { type: 'json_object' }` no siempre lo soportan los modelos free — la estrategia es prompt JSON estricto + validación zod en application.
- El módulo `enrichment` es el único consumidor; la implementación del adapter vive en `enrichment/infrastructure/openrouter-llm-provider.ts`.
