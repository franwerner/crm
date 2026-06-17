# ROADMAP — Ingesta de contactos por Excel + Enriquecimiento LLM

Dos features acopladas que comparten infraestructura asíncrona (Redis + BullMQ + workers
en procesos separados). La DB es la fuente de verdad; las colas son transporte desechable.

## Decisiones ya fijadas

- **Stack base**: Bun + Hono + Drizzle + Postgres + MinIO (existente).
- **Async**: Redis + BullMQ para **2 colas** (`import`, `enrich-llm`). Workers en **procesos
  separados** (uno de ingesta, uno de LLM). La tabla es la fuente de verdad; la cola es transporte.
- **Durabilidad**: el estado vive en DB (`imports.status`, `contact_insights.status`).
  Redis se puede caer sin perder trabajo → reconciliación re-encola desde la DB.
- **Logging**: **pino** (interface `Logger` en `src/shared`, inyectada vía composition root). Formato
  por entorno: `pino-pretty` en dev / JSON a stdout en prod; nivel por `LOG_LEVEL`. **Rotación vía
  Docker log driver** (`max-size`/`max-file`), no archivos en disco. Por capa: **domain no loggea**
  (lanza errores), **application solo vía puerto inyectado**, **infrastructure + http** son los que
  loggean. Request logging = **middleware Hono propio** con `reqId` (`logger.child`); descartar el
  `hono/logger` built-in y `pino-http`. Cierra el ADR `observability/logging` (Pending → Accepted).
- **Resiliencia del import** (caída a mitad): batch **transaccional** (insert + checkpoint
  `processedRows` en el mismo commit) + **resume desde offset** al reintentar + **dedup idempotente**
  como red. BullMQ reintenta el job stalled; reconciliación por DB como red última. Peor caso:
  reprocesar 1 batch. Tamaño de batch = `clamp(ceil(total/100), 200, 2000)` (~1% del total).
- **Feature 1**: mapeo de columnas **manual** (los Excel comprados varían por proveedor).
  Logging estrategia **A+C**: contadores en `imports` + `rejected.csv` en MinIO (sin tabla por-fila).
  Streaming por batches (archivos de 10k–40k filas). **Dedup** por email-o-teléfono → **saltar**;
  contadores separados: `ok` / `fallidas` / `duplicadas`.
- **Feature 2**: análisis por **rubro** vía **templates** (el template ES el prompt de qué
  observar). Output de **shape fijo** en lenguaje natural `{ resumen, recomendaciones, observaciones }`
  para todos los rubros (la variación la mete el prompt, no el shape → sin output dinámico, sin
  render schema-driven). Versionado por template.
- **LLM**: **OpenRouter** como gateway, **una sola cuenta** (multi-cuenta descartado: viola ToS,
  riesgo de baneo en producción). Detrás de un **puerto abstracto `LLMProvider`** para desacoplar
  gateway/provider/modelo. **La rotación/fallback de modelos es responsabilidad del gateway externo**
  (revisión: ver Fase 2). **Tracking obligatorio** por análisis (model, tokens, cost, gateway) en
  `contact_insights`, aunque el tier sea gratuito.
- **Trigger del análisis** (4 mecanismos, todos crean el insight al **solicitar**, nunca en la ingesta):
  1. **Check en la ingesta** — toggle "analizar al terminar" en el wizard; si on, encola los análisis
     de los contactos recién creados.
  2. **Batch por filtros** — selección por las conditions/filtros existentes; **saltea los contactos
     que ya tienen `contact_insights`** (en cualquier estado) → no re-analiza ni re-gasta.
  3. **Individual** — analizar un contacto puntual.
  4. **Reintentar** (agotó `maxAttempts`) — **individual** o **masivo sobre `failed`**.
- **Estados/reintentos del insight**: `contact_insights.status` = `queued`→`processing`→`completed`|`failed`.
  Campos en tabla: `attempts` + `lastError`. Tope config por ENV (`LLM_MAX_ATTEMPTS`, default 5).
  **Reintento uniforme** gobernado por **BullMQ** (backoff exponencial); agotado → `failed`. `failed`
  es **re-disparable**. El detalle por intento va a `lastError` (último error real persistido en DB).
- **Contacto**: se crea siempre en la ingesta. El `contact_insights` se crea **al solicitar el
  análisis** (on-demand), no uno por contacto en la ingesta.
- **Validación de canales**: checker de canales (email→sintaxis+MX DNS, teléfono→libphonenumber E.164),
  servicio compartido (ingesta + alta/edición manual). `contact_channels.verificationStatus`
  (unverified/valid/invalid). La UI muestra un ícono de validado por canal.

---

## Fase 0 — Infraestructura asíncrona (base compartida) ✅ COMPLETADA

- [x] Agregar **Redis** como service en `docker-compose.yml`
- [x] Agregar **BullMQ + ioredis** (validar compatibilidad fina con Bun)
- [x] Abstracción de cola en `src/shared/queue` (DI manual, respetar reglas de capas)
- [x] Entrypoint de **worker separado** + service en `docker-compose.yml`
- [x] Job de **reconciliación** (re-encolar `pending` / levantar `processing` colgados desde DB)
- [x] Logger **pino**: interface `Logger` en `src/shared`, impl pino, inyectada en el composition root
- [x] Formato por entorno (`pino-pretty` dev / JSON stdout prod), nivel por `LOG_LEVEL`; rotación por Docker log driver
- [x] Middleware de request logging propio para Hono (pino + `reqId` vía `logger.child`)
- [x] Registrar techs nuevas en el catálogo de ADRs (`redis`, `bullmq`, `pino`); cerrar ADR `observability/logging`
- [x] ADR de **background-jobs** (hoy marcado N/A en runtime)

## Fase 1 — Ingesta de contactos por Excel ✅ COMPLETADA

> Completa y verificada end-to-end (flujo SDD lane full, archive 2026-06-17). Migración `0009` aplicada, cliente kubb regenerado, smoke e2e OK. Streaming real con `exceljs` WorkbookReader; UoW port; límite config-driven (`IMPORT_MAX_FILE_SIZE_MB`); cache MX con `Bun.redis` nativo.

- [x] Módulo `imports` (hexagonal: domain/application/infrastructure/http)
- [x] Tabla `imports` + migración
- [x] Registrar tech `exceljs` (streaming)
- [x] Endpoint **upload** → MinIO + parsear headers
- [x] Endpoint **definir mapping** (columna Excel → campo Contact)
- [x] Crear `import` en `pending` + encolar job
- [x] Worker de ingesta: lectura en **streaming**, batch `clamp(ceil(total/100), 200, 2000)`
- [x] Batch **transaccional**: bulk-insert + checkpoint `processedRows`
- [x] **Resume desde offset** al reintentar
- [x] UI deriva el % de progreso de `processedRows / totalRows`
- [x] **Dedup** por email-o-teléfono → saltar; contadores `ok` / `fallidas` / `duplicadas`
- [x] Extender `contact_channels` con `verificationStatus`, `verifiedAt`, `verificationDetail` + migración
- [x] **Checker de canales** compartido: email (sintaxis + MX DNS, cache por dominio), teléfono (E.164)
- [x] Conectar el checker en la ingesta + en `addChannel`/`updateChannel`
- [x] Registrar tech `libphonenumber-js`
- [x] Acumular rechazados/duplicados → `rejected.csv` en MinIO + link en `imports`
- [x] Endpoint de **estado/progreso** (polling)

## Fase 2 — Enriquecimiento LLM ✅ COMPLETADA

> Completada y verificada e2e (flujo SDD lane full, archive 2026-06-17). Módulo `enrichment`.
> **Desvíos vs el plan original**: (1) **rotación de modelos eliminada del CRM** y delegada al
> gateway externo (OpenRouter `openrouter/free` auto-router) — los ítems de modelos-free-hardcoded y
> rotación/cooldown propios quedaron **reemplazados**; (2) **Firecrawl / scraping diferido** (el worker
> usa solo datos del contacto); (3) estado terminal exitoso es **`completed`** (no `done`); (4) **solo
> polling**, sin SSE → `event-contract` N/A. Follow-ups resueltos: parsing robusto de JSON "sucio" +
> reintento por BullMQ; `InsightOut` registrado como componente OpenAPI; tracking de `lastError` real.

- [x] Tabla `analysis_templates` + migración
- [x] Tabla `contact_insights` (status `queued`/`processing`/`completed`/`failed`, attempts, lastError, tracking) + migración
- [x] Config ENV `LLM_MAX_ATTEMPTS` (default 5) validada en zod
- [x] Crear `contact_insights` **al solicitar el análisis** en `queued` + encolar `enrich-llm`
- [x] Puerto `LLMProvider` + adapter **OpenRouter** (SDK OpenAI-compatible)
- [x] Registrar tech OpenRouter
- [ ] ~~Const de modelos free hardcodeados (rpm/rpd)~~ — **reemplazado**: gateway resuelve el modelo
- [ ] ~~Rotación/fallback entre modelos free (cooldown Redis)~~ — **reemplazado**: rotación delegada al gateway externo (ver `sdd/.../rotation-removal`)
- [x] **4 triggers**: check en ingesta · batch por filtros · individual · reintentar
- [x] Reintento **uniforme** hasta `LLM_MAX_ATTEMPTS` (BullMQ backoff) → `failed`; re-disparable
- [x] Persistir tracking (model/tokens/cost/gateway) en cada análisis `completed`
- [ ] ~~Firecrawl self-host en `docker-compose.yml`~~ — **diferido**
- [ ] ~~Cliente de scraping contra Firecrawl~~ — **diferido**
- [ ] ~~Registrar tech `firecrawl`~~ — **diferido**
- [x] Worker de LLM (proceso separado): prompt del template + datos del contacto → LLM (sin scraping)
- [x] Validar el output contra el shape fijo `{resumen, recomendaciones, observaciones}` (+ parsing robusto)
- [x] Transiciones de estado `processing` → `completed` | reintento → `failed` (`lastError`)
- [x] Reconciliación de insights `queued`/`processing` colgados
- [x] ADR de **resilience** (reescrito: resiliencia = retry BullMQ + reconciliación; rotación al gateway)

## Fase 3 — UI ✅ COMPLETADA

> Completada y verificada e2e (flujo SDD lane full, archive 2026-06-17). 5 bloques. Sumó cambios de
> backend: `GET /imports` (lista paginada), mapping con opt-in de análisis, batch-por-filtro
> (`resolveByFilter` cross-slice), `GET /enrichments?contactId`, `verificationStatus` en el DTO de
> canal. Ajustes UI post-entrega: fix de `/settings`, modal de análisis **autónomo** con filtros
> propios + contador on-demand, **reanudar wizard** desde "Esperando mapeo", botón **"Volver"** en el wizard.

- [x] Pantalla de **ingestas**: lista, estado, progreso, descarga de `rejected.csv`
- [x] Wizard de ingesta: upload → mapper de columnas → confirmar template → check "analizar al terminar"
- [x] CRUD de **templates** (`/settings/templates`)
- [x] Vista del **insight por contacto** (tab "Análisis") + estado (`queued`/`processing`/`completed`/`failed` + `lastError`)
- [x] Acciones de análisis: **individual** · **batch por filtros** · **reintentar**
- [x] **Ícono de validado por canal** según `verificationStatus` (valid→check, invalid→warning, unverified→gris)
- [x] Regenerar cliente API (kubb) tras los nuevos endpoints

---

## Fase 4 — Mapeo extendido de ingesta + verificación diferida de canales

> Diseño cerrado en conversación (2026-06-17). **Dos cambios acoplados**: (1) el mapeo de ingesta deja
> de ofrecer solo `name/email/phone` y pasa a soportar **todos los campos de texto del contacto + todos
> los tipos de canal**, vía un **catálogo dinámico**; (2) la verificación de canales se **parte** en
> validación local (inline) + verificación de red (MX) **diferida a un job async**.

### Decisiones fijadas

- **Campos mapeables**: todos los **escalares de texto** de `contacts` (`name`, `notes`,
  `addressStreet`, `addressNumber`, `addressPostalCode`, `addressCity`, `addressProvince`,
  `addressCountry`) + **todos los tipos de canal** (`Email`, `Phone`, `WhatsApp`, `Instagram`,
  `Website`, `Other`). **Los enums quedan FUERA** (`contactType`, `sex`, `sourceChannel`,
  `interestLevel`, `pipelineState`) — se setean dentro del CRM, no se importan.
- **Catálogo dinámico**: endpoint `GET /imports/mappable-fields` que devuelve los destinos con
  metadata (`key`, `label`, `kind: scalar|channel`, `required`). El front puebla el select desde ahí
  (sin hardcode). Si el modelo crece, los campos aparecen solos.
- **Obligatorios en la UI**: los campos requeridos de la entidad (hoy solo `name`) se muestran
  **marcados como obligatorios** en el mapper; la regla "al menos email/phone" se reemplaza por
  "al menos el **nombre**".
- **Requisito mínimo del contacto**: `name` (es `NOT NULL`). **Fila sin nombre → rechazada**
  (`rejected.csv`). **Contacto sin canales → se crea igual** (ya no se exige canal).
- **Verificación híbrida (approach A)**: en la ingesta solo validación **local sin red** (sintaxis
  email, E.164 phone): basura → se **omite el canal**; OK → el canal nace **`unverified`**. El **MX
  (red)** se difiere a un **cronjob que BARRE los canales `unverified`** (de a ~10 por vuelta) y corre
  el MX en batch — **NO se encola un mensaje por canal** (una ingesta de 40k no debe generar 40k jobs).
  **Disparo decidido**: **BullMQ repeatable job** (cron, cada ~1 min). El schedule vive en Redis → no
  se duplica con múltiples workers. Worker `concurrency: 1` → ejecuciones **secuenciales** (el siguiente
  espera al actual). Batch chico (~10) + cache MX mantienen cada vuelta rápida (sin backlog).
- **Arquitectura**: la validación local (sintaxis/E.164) es **dominio puro** → vive en
  `shared/verification/` (kernel compartido, sin I/O), reusada por ingesta + alta/edición manual. El
  MX (red) es **infraestructura** → port + adapter, ejecutado por el worker de verificación. Se
  **parte** el `ChannelChecker` actual en `validateSyntax` (puro) + `verifyNetwork` (infra async).

### Backend — datos & dominio
- [ ] Ampliar `ImportContactRecord` con los escalares de texto (`notes`, `addressStreet/Number/PostalCode/City/Province/Country`)
- [ ] Ampliar `ImportChannelRecord.channelType` a todos los tipos del enum (`Email, Phone, WhatsApp, Instagram, Website, Other`)
- [ ] Bulk repo (adapter Drizzle): persistir los campos escalares en `contacts`
- [ ] Use-case de ingesta: pasar escalares al record; construir canales de todos los tipos; **rechazar fila sin nombre**; **crear contacto sin canales**; validación local inline (sin MX)

### Backend — validación / verificación diferida
- [ ] Partir el `ChannelChecker`: `validateSyntax(type, value)` **puro** en `shared/verification` (sintaxis email + E.164 phone, sin red) + `verifyNetwork` (MX) como **port + adapter de infra** y validateUrl.
- [ ] Ingesta y alta/edición manual: usar `validateSyntax` inline; el canal nace `unverified`
- [ ] Extender el `BullMQAdapter` (Fase 0) con `registerRepeatable(queue, every, handler)` (usa el `repeat` nativo de BullMQ)
- [ ] **Cronjob de verificación** (cola `verify-channels`, repeatable cada ~1 min): handler que hace `SELECT` de canales `unverified` de a ~10 (**cooldown por `verifiedAt`**: `WHERE verifiedAt IS NULL OR verifiedAt < now()-1h`, orden NULLS FIRST) → corre `verifyNetwork` (MX) + validación de URL (Website) → `UPDATE verificationStatus`. **NO encola por canal.**
- [ ] El handler corre en el proceso **worker** (`concurrency: 1` → secuencial, sin solape)

### Backend — catálogo dinámico
- [ ] Endpoint `GET /imports/mappable-fields` → catálogo de destinos (`key`, `label`, `kind`, `required`)
- [ ] Validar el `mapping` contra el catálogo (rechazar destinos desconocidos)

### Frontend
- [ ] `MappingStep`: poblar el select **dinámicamente** desde el catálogo, **agrupado** (Campos del contacto / Canales)
- [ ] Marcar **obligatorios** (`name`) en la UI; regla "mapeá al menos el nombre"
- [ ] Regenerar cliente kubb tras los cambios de contrato

### rejected.csv
- [ ] Ajustar: ya no se rechaza por "sin canal"; solo **duplicados** + **filas sin nombre**

---

## Pendientes (detalle al design / implementación)

- [x] ~~Detalle fino del fallback de modelos~~ — **obsoleto**: la rotación se delegó al gateway externo (Fase 2)
- [x] ~~ADR `event-contract` (SSE)~~ — **N/A**: solo polling
