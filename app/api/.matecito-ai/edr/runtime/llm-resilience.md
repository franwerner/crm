# EDR — Resiliencia LLM (resiliencia del lado del CRM)

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-06-17

## Contexto

El enriquecimiento consume modelos LLM a través de OpenRouter en el tier gratuito. Los modelos free tienen límites estrictos de rpm/rpd y pueden devolver errores transitorios. Hace falta una estrategia que: (a) no pierda jobs, (b) sea observable ante un fallo, (c) sea simple de mantener. Es la primera dependencia externa del proyecto que justifica una estrategia de resiliencia.

## Decisión

**El gateway externo es responsable de la elección, rotación y fallback de modelos. El CRM implementa resiliencia de su lado mediante retry del job-queue + reconciliación + persistencia del último error.**

**Responsabilidades del gateway (OpenRouter / futuro servicio propio):**
- Elegir qué modelo concreto atiende cada request.
- Rotar entre modelos cuando uno está saturado.
- Absorber los 429 de los modelos free internamente.
- El CRM pasa un único identificador de gateway (slug `openrouter/free`) y el gateway resuelve.

**Responsabilidades del CRM:**
- **Retry del job-queue:** cada job tiene un número de intentos configurado con backoff exponencial. Si el gateway devuelve error, el job-queue reintenta automáticamente.
- **Persistencia del último error:** antes de re-lanzar, el use-case persiste el mensaje real del error (sin cambiar el status — sigue en proceso). Cada reintento sobreescribe ese campo con el motivo más reciente.
- **Reconciliación:** un proceso detecta insights colgados (en proceso o encolados más allá de un umbral de tiempo) y los re-encola. Al marcar un insight como fallido por agotamiento de intentos, preserva el último error real.
- **Config:** un único slug de gateway (string, default `openrouter/free`), no una lista de modelos.

**Terminal:** al agotar los intentos, el job queda en el failed set / DLQ del job-queue; el insight queda fallido con el último error real persistido (recuperable vía retry in-place).

## Reglas verificables

- **[manual]** El CRM no implementa rotación de modelos ni cooldown por modelo; esa lógica vive únicamente en el gateway externo.
- **[manual]** El use-case persiste el mensaje real del error del último intento antes de re-lanzar.
- **[manual]** La reconciliación preserva ese último error real al marcar el insight como fallido por intentos agotados (no lo pisa con un mensaje genérico).
- **[manual]** El gateway se configura como un único slug (string), no como una lista CSV de modelos.
- **[manual]** El estado durable del insight (encolado/en proceso/completado/fallido, intentos, último error) vive en Postgres, según [background-jobs.md](background-jobs.md).

## Alternativas consideradas

- **Rotación manual + cooldown en Redis (primera versión del módulo):** un circuit-breaker propio con cooldown por modelo en Redis, orden de rotación por lista CSV y un loop de reintentos ante 429 en el use-case. Descartada porque: (a) el gateway ya hace el fallback internamente, (b) duplica una responsabilidad que es del gateway, (c) añade complejidad y una dependencia extra de Redis en el módulo.
- **Solo retry del job-queue sin persistir el error:** no deja trazabilidad del motivo real por reintento; el último error en Postgres es la única observabilidad disponible sin logging costoso. Descartada.
- **Circuit-breaker propio:** añade complejidad que el gateway ya absorbe. Descartado.

## Consecuencias

**Positivas:** superficie de código reducida; sin dependencia adicional de Redis en el módulo de enriquecimiento; la lógica de resiliencia queda claramente separada entre gateway y CRM; el último error persistido es siempre el mensaje real.

**Negativas / trade-offs:** el CRM cede el control de qué modelo se usa en cada request (ya no elige ni rota); el modelo reportado en el insight refleja lo que el gateway informa (puede ser un modelo concreto o el alias `openrouter/free`); si el gateway no retorna un 429 explícito sino otro tipo de error, el job-queue igual reintenta (correcto, pero menos informativo que el circuito manual anterior).

## Relacionados

- `depende-de` → [background-jobs.md](background-jobs.md) — el retry, la DLQ y el estado durable se apoyan en la infraestructura de colas y en la persistencia en Postgres.
