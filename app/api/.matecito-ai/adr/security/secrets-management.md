# ADR — Manejo de secretos

- **Status:** Accepted
- **Fecha de creación:** 2026-05-17
- **Última actualización:** 2026-05-17
- **Decisores:** ifran
- **Fase:** secrets-management

> **ADR hermano:** el mecanismo de carga y validación de configuración (schema `zod` al startup, módulo `src/shared/config`) vive en [`../delivery/configuration.md`](../delivery/configuration.md). Este ADR cubre la política de secretos: cómo se aprovisionan y protegen las credenciales que esa config contiene.

## Contexto

Un CRM maneja credenciales sensibles desde la primera línea: el secret de firma de JWT (`auth.md`), la URL de conexión a Postgres, y a futuro endpoints/keys de object storage (`../data/file-storage.md`). Hay que decidir cómo se aprovisionan y protegen esos secretos sin sobredimensionar la solución para un greenfield de un solo dev.

## Decisión

**Secretos vía variables de entorno, sin secret manager dedicado por ahora.**

- Los secretos se inyectan como **variables de entorno reales del entorno** en prod, y vía archivo `.env` (gitignored) en dev. No hay Vault, AWS Secrets Manager, ni equivalente.
- Los secretos se consumen SIEMPRE a través del objeto de config tipado y validado de [`../delivery/configuration.md`](../delivery/configuration.md). Ningún módulo lee `Bun.env`/`process.env` crudo para obtener un secreto.
- Los secretos **nunca** se loguean ni se incluyen en respuestas de error (ver `../runtime/error-handling.md` §4.5: passwords, tokens, API keys y cookies nunca se loguean).
- El archivo `.env` está en `.gitignore`; el repo mantiene un `.env.example` con las claves (sin valores).

## Alternativas consideradas

- **Secret manager (Vault / AWS Secrets Manager / cloud) desde ya:** overkill para un greenfield de un solo dev; suma operación e infraestructura sin pagar a esta escala. Descartado por ahora.
- **Secretos hardcodeados o en el repo:** descartado de plano (riesgo de filtración, sin rotación).

## Consecuencias

**Positivas:** simple, sin infraestructura extra; coherente con el stack minimalista; los secretos viven fuera del repo.

**Negativas / trade-offs:** los secretos en prod se manejan vía env vars del entorno (sin secret manager dedicado) — aceptable en esta etapa, **revisar al ir a producción seria** (rotación, auditoría de acceso, cifrado en reposo del store de secretos). Sin un secret manager no hay rotación automática ni auditoría de acceso a credenciales.

## Reglas concretas

- Todo secreto se aprovisiona como variable de entorno y se consume vía el objeto de config de [`../delivery/configuration.md`](../delivery/configuration.md). Prohibido leer un secreto desde `Bun.env`/`process.env` fuera del módulo `src/shared/config`.
- Ningún secreto se loguea, se serializa en una respuesta ni se commitea al repo (`.env` gitignored; `.env.example` sin valores).
- Introducir un secret manager dedicado es una decisión nueva: se reabre este ADR al planificar producción seria.
