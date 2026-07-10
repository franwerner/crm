# EDR — Integración externa: port LLMProvider

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-06-17
- **Applied pattern:** Ports & Adapters — aísla el borde LLM externo detrás de una interface para testear con un fake y cambiar de gateway sin tocar la aplicación.

## Contexto

El módulo de enriquecimiento llama a un LLM externo para generar insights de contactos. Es la primera vez que el proyecto cruza un borde hacia un sistema externo no controlado: red, latencia, errores transitorios, rate limits, secretos. Hay que definir el contrato de ese borde respetando la comunicación entre capas del proyecto (el port en domain), el manejo de secretos (la API key) y la jerarquía de errores.

## Decisión

El borde de integración con el LLM externo se aísla detrás de un port (Ports & Adapters): el contrato vive en la capa de dominio del módulo de enriquecimiento y el adapter concreto en infraestructura. El caso de uso depende solo de la interface, nunca del SDK externo.

- **Contrato del port:** expone una operación de completion que recibe system prompt, contenido de usuario y un slug de gateway, y devuelve el texto generado más metadata de trazabilidad (el modelo efectivamente usado y el conteo de tokens de prompt y de completion).
- **El modelo es un slug de gateway:** el CRM pasa el slug configurado y el gateway (OpenRouter, o un futuro servicio propio) decide qué modelo concreto atiende el request. El adapter reporta el modelo concreto que el gateway dijo haber usado, para trazabilidad en el insight.
- **Sin error tipado de rate-limit:** el adapter no mapea el 429 del proveedor a un tipo especializado; los errores del SDK se propagan como error estándar. El caso de uso captura el mensaje para persistirlo y rethrow; el reintento queda delegado a la cola de background. La gestión de rate-limit es responsabilidad del gateway, no del CRM.
- **Adapter:** único lugar que toca el SDK externo. El caso de uso depende solo de la interface.
- **Secretos:** la API key se aprovisiona como variable de entorno y se consume vía config tipada, nunca leída cruda. Nunca se loguea ni se serializa en una respuesta de error.
- **Timeout:** la llamada externa tiene timeout configurado (no espera indefinida); un timeout es un error transitorio delegado al retry de la cola.

## Alcance

- `**/enrichment/domain/llm-provider.ts` — el contrato del port `LLMProvider` (en la capa domain del módulo).
- `**/enrichment/infrastructure/openrouter-llm-provider.ts` — el adapter concreto; único lugar que importa el SDK externo.

## Reglas verificables

- **[tool: dependency-cruiser]** domain y application del módulo de enriquecimiento no importan el SDK externo (`openai`) ni hacen `fetch` directo al proveedor: dependen del port `LLMProvider`. Solo el adapter de infraestructura importa el SDK.
- **[tool: dependency-cruiser]** el port `LLMProvider` vive en `domain/`, no en application.
- **[manual]** no existe un tipo de error de rate-limit en el contrato del port; los errores del gateway se propagan como error estándar y los maneja el retry de la cola.
- **[manual]** la API key (`OPENROUTER_API_KEY`) se consume vía config tipada; prohibido leer `Bun.env` / `process.env` para obtenerla.
- **[manual]** el parámetro de modelo es el slug del gateway (`OPENROUTER_MODEL`), no un identificador de modelo concreto.

## Alternativas consideradas

- **Pasar el SDK externo crudo al caso de uso** — acopla la application al SDK externo; se rechaza a favor del port.
- **Mantener un error tipado de rate-limit en el port** — era necesario cuando el CRM rotaba modelos internamente. Con la rotación delegada al gateway, ese contrato ya no tiene consumidor en application. Descartado.

## Consecuencias

**Positivas:** la lógica de enriquecimiento es agnóstica del proveedor LLM (testeable con un fake del port); el borde externo está aislado en un solo adapter; el contrato del port es simple (sin tipos de error especializados); cambiar de gateway toca solo el adapter y la configuración.

**Negativas / trade-offs:** al no tipar el rate-limit, el caso de uso no puede distinguir un 429 de un error de red — ambos se delegan al mismo retry de la cola. Si en el futuro hiciera falta diferenciarlos (p. ej. para una DLQ selectiva), habría que re-introducir un tipo de error especializado en el port.

## Relacionados

- `depende-de` → [../structure/inter-layer-communication.md](../structure/inter-layer-communication.md) — el port vive en la capa domain.
- `depende-de` → [../security/secrets-management.md](../security/secrets-management.md) — manejo de la API key de la integración.
- `depende-de` → [../runtime/error-handling.md](../runtime/error-handling.md) — jerarquía de errores del proyecto.
- `relacionado-con` → [../runtime/llm-resilience.md](../runtime/llm-resilience.md) — resiliencia y rotación de modelos de esta integración (cooldown + retry).
- `relacionado-con` → [../tech/openrouter.md](../tech/openrouter.md) — elección del SDK/gateway y los modelos.
