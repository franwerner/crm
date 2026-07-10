# EDR — Manejo de secretos

- **Status:** Accepted
- **Type:** policy
- **Date:** 2026-05-17

## Contexto

Un CRM maneja credenciales sensibles desde la primera línea: el secret de firma de JWT, la URL de conexión a Postgres y, a futuro, endpoints/keys de object storage. Hay que decidir cómo se aprovisionan y protegen esos secretos sin sobredimensionar la solución para un greenfield de un solo dev.

## Decisión

**Secretos vía variables de entorno, sin secret manager dedicado por ahora.**

- Los secretos se inyectan como variables de entorno reales del entorno en prod, y vía archivo `.env` (gitignored) en dev. No hay Vault, AWS Secrets Manager ni equivalente.
- Los secretos se consumen SIEMPRE a través del objeto de config tipado y validado (ver [../delivery/configuration.md](../delivery/configuration.md)). Ningún módulo lee el entorno crudo para obtener un secreto.
- Los secretos nunca se loguean ni se incluyen en respuestas de error (ver [../runtime/error-handling.md](../runtime/error-handling.md): passwords, tokens, API keys y cookies nunca se loguean).
- El repo mantiene un `.env.example` con las claves (sin valores); el `.env` real está gitignored.

> **Sub-decisión Pending — secret manager dedicado.** Introducir un secret manager (rotación automática, auditoría de acceso, cifrado en reposo del store) es una decisión nueva. Trigger: al planificar producción seria. Hasta entonces, env vars.

## Reglas verificables

- **[manual]** Todo secreto se aprovisiona como variable de entorno y se consume vía el objeto de config validado; prohibido leer un secreto desde el entorno crudo fuera del módulo de config (`src/shared/config`).
- **[manual]** Ningún secreto se loguea, se serializa en una respuesta ni se commitea al repo (`.env` gitignored; `.env.example` sin valores).

## Alternativas consideradas

- **Secret manager (Vault / AWS Secrets Manager / cloud) desde ya:** overkill para un greenfield de un solo dev; suma operación e infraestructura sin pagar a esta escala. Descartado por ahora (ver sub-decisión Pending).
- **Secretos hardcodeados o en el repo:** descartado de plano (riesgo de filtración, sin rotación).

## Consecuencias

**Positivas:** simple, sin infraestructura extra; coherente con el stack minimalista; los secretos viven fuera del repo.

**Negativas / trade-offs:** los secretos en prod se manejan vía env vars del entorno, sin secret manager dedicado — aceptable en esta etapa, a revisar al ir a producción seria (rotación, auditoría de acceso, cifrado en reposo). Sin un secret manager no hay rotación automática ni auditoría de acceso a credenciales.

## Relacionados

- `relacionado-con` → [../delivery/configuration.md](../delivery/configuration.md) — el mecanismo de carga y validación de config (schema al startup) es el hermano de esta política; los secretos se consumen a través de él.
- `relacionado-con` → [auth.md](auth.md) — el secret de firma de JWT es uno de los secretos que esta política gobierna.
