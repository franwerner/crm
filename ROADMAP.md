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
  gateway/provider/modelo. Modelo por config + override por template. **Rotación/fallback entre
  modelos free** ante `429`/timeout (cooldown del que falla → siguiente; da resiliencia, no más
  cuota). Límites/cuotas por modelo **hardcodeados** en código. **Tracking obligatorio** por análisis
  (model, tokens, cost, gateway) en `contact_insights`, aunque el tier sea gratuito.
  Si hace falta más volumen: $10 de créditos (1000 req/día) o tier pago — "luego vemos".
- **Trigger del análisis** (4 mecanismos, todos crean el insight al **solicitar**, nunca en la ingesta):
  1. **Check en la ingesta** — toggle "analizar al terminar" en el wizard; si on, encola los análisis
     de los contactos recién creados.
  2. **Batch por filtros** — selección por las conditions/filtros existentes; **saltea los contactos
     que ya tienen `contact_insights`** (en cualquier estado) → no re-analiza ni re-gasta.
  3. **Individual** — analizar un contacto puntual.
  4. **Reintentar** (agotó `maxAttempts`) — **individual** o **masivo sobre `failed`** (mismo batch
     por filtros pero `status = failed`: re-dispara y resetea `attempts`; para usar tras rotar key /
     cargar crédito, evita el click-por-click cuando la causa del fallo es común).
- **Estados/reintentos del insight**: `contact_insights.status` = `queued`→`processing`→`done`|`failed`.
  Campos en tabla: `attempts` (contador, visibilidad) + `lastError`. El **tope es config por ENV**
  (`LLM_MAX_ATTEMPTS`, **default 5**), NO columna por insight. **Reintento uniforme** (no distingue
  tipo de error) gobernado por **BullMQ** (backoff exponencial); agotado → `failed`. `failed` es
  **re-disparable** (resetea `attempts`). El **detalle por intento** (modelo/error) va a **app logs
  temporales**, NO a la DB (sin tabla aparte).
- **Cooldown de modelos en Redis**: cuando un modelo da `429`, se marca en Redis con TTL (estado
  efímero compartido entre workers) para que ningún worker le pegue hasta que expire. El log de qué
  modelo se usó por análisis va a la DB (tracking); el cooldown vivo va a Redis.
- **Contacto**: se crea siempre en la ingesta. El `contact_insights` se crea **al solicitar el
  análisis** (on-demand), no uno por contacto en la ingesta (evita 40k filas vacías).
- **Validación determinística de canales**: checker síncrono en la ingesta (email→MX DNS,
  teléfono→libphonenumber E.164), modelado como **servicio compartido** (ingesta + alta/edición
  manual de canal). Extiende `contact_channels` con `verificationStatus` (unverified/valid/invalid).
  La UI muestra un SVG de validado por canal. Instagram fuera por ahora.
- **Scraping**: solo **web propia** del contacto, con **Firecrawl self-host** como motor
  (render + extracción a markdown listo para LLM; reemplaza a Browserless/Playwright/Readability).
  **Sin proxy** por ahora (sale con la IP del server; suficiente para webs de PyMEs). Si aparecen
  bloqueos por IP → evaluar sumar proxy (servicio aparte, futuro). Si la URL falla → el análisis corre igual.

---

## Fase 0 — Infraestructura asíncrona (base compartida)

- [x] Agregar **Redis** como service en `docker-compose.yml`
- [x] Agregar **BullMQ + ioredis** (validar compatibilidad fina con Bun)
- [x] Abstracción de cola en `src/shared/queue` (DI manual, respetar reglas de capas)
- [x] Entrypoint de **worker separado** + service en `docker-compose.yml`
- [x] Job de **reconciliación** (re-encolar `pending` / levantar `processing` colgados desde DB) — _scaffolding (contrato/hook); lógica por tabla en Fases 1/2_
- [x] Logger **pino**: interface `Logger` en `src/shared`, impl pino, inyectada en el composition root
- [x] Formato por entorno (`pino-pretty` dev / JSON stdout prod), nivel por `LOG_LEVEL`; rotación por Docker log driver
- [x] Middleware de request logging propio para Hono (pino + `reqId` vía `logger.child`)
- [x] Registrar techs nuevas en el catálogo de ADRs (`redis`, `bullmq`, `pino`); cerrar ADR `observability/logging` (Pending → Accepted)
- [x] ADR de **background-jobs** (hoy marcado N/A en runtime)

## Fase 1 — Ingesta de contactos por Excel

- [ ] Módulo `imports` (hexagonal: domain/application/infrastructure/http)
- [ ] Tabla `imports` (archivo, estado, etapa, progreso, contadores, `template_id`, mapping) + migración
- [ ] Registrar tech `exceljs` (streaming) en el catálogo
- [ ] Endpoint **upload** → guardar Excel en MinIO + parsear headers (preview de columnas)
- [ ] Endpoint **definir mapping** (columna Excel → campo Contact)
- [ ] Crear `import` en `pending` + encolar job
- [ ] Worker de ingesta: lectura en **streaming**, batch `clamp(ceil(total/100), 200, 2000)`
- [ ] Batch **transaccional**: bulk-insert de contactos + checkpoint `processedRows` en el mismo commit
- [ ] **Resume desde offset** al reintentar (leer `processedRows`, saltar filas ya procesadas)
- [ ] UI deriva el % de progreso de `processedRows / totalRows`
- [ ] **Dedup** por email-o-teléfono → saltar; contar aparte `ok` / `fallidas` / `duplicadas`
- [ ] Extender `contact_channels` con `verificationStatus` (unverified/valid/invalid), `verifiedAt`, `verificationDetail` (JSON) + migración
- [ ] **Checker de canales** como servicio compartido: email (sintaxis + MX DNS, cache por dominio), teléfono (libphonenumber-js → E.164)
- [ ] Conectar el checker en la ingesta + en `addChannel`/`updateChannel` (alta/edición manual)
- [ ] Registrar tech `libphonenumber-js`
- [ ] Acumular rechazados/duplicados → generar `rejected.csv` → subir a MinIO + linkear en `imports`
- [ ] Endpoint de **estado/progreso** (polling)

## Fase 2 — Enriquecimiento LLM

- [ ] Tabla `analysis_templates` (name, rubro, prompt, model/provider, version, is_active) + migración
- [ ] Tabla `contact_insights` (contact_id, template_id, `template_version`, output `{resumen, recomendaciones, observaciones}` JSONB, **status `queued`/`processing`/`done`/`failed`, attempts, lastError**, model, tokens_prompt, tokens_completion, cost, gateway) + migración
- [ ] Config ENV **`LLM_MAX_ATTEMPTS`** (default 5) validada en `src/shared/config` (zod); gobierna el tope de reintentos de BullMQ
- [ ] Crear `contact_insights` **al solicitar el análisis** (no en la ingesta) en estado `queued` + encolar `enrich-llm`
- [ ] Puerto abstracto **`LLMProvider`** (desacopla gateway/provider/modelo) + adapter **OpenRouter** (una cuenta)
- [ ] Registrar tech OpenRouter (SDK OpenAI-compatible)
- [ ] Const de **modelos free con límites hardcodeados** (rpm/rpd) para selección y rotación
- [ ] **Rotación/fallback entre modelos free** (cooldown del que falla en **Redis con TTL** → siguiente)
- [ ] **4 triggers**: check en ingesta · batch por filtros (saltea los que ya tienen insight) · individual · reintentar (**individual o masivo sobre `failed`**, resetea `attempts`)
- [ ] Reintento **uniforme** hasta `LLM_MAX_ATTEMPTS` (BullMQ backoff) → `failed`; `failed` re-disparable; detalle por intento a **app logs** (no DB)
- [ ] Persistir tracking (model/tokens/cost/gateway) en cada análisis `done`
- [ ] **Firecrawl self-host** como service(s) en `docker-compose.yml` (trae su propio stack: Redis + browser + workers)
- [ ] Cliente de scraping contra Firecrawl (URL → markdown) — solo web propia, sin proxy
- [ ] Registrar tech `firecrawl` (self-host)
- [ ] Worker de LLM (proceso separado): prompt del template + datos del contacto + scraping → LLM
- [ ] Validar el output contra el shape fijo `{resumen, recomendaciones, observaciones}`
- [ ] Transiciones de estado: `processing` → `done` (con output+tracking) | reintento hasta `LLM_MAX_ATTEMPTS` → `failed` (`lastError`)
- [ ] Reconciliación de insights `queued`/`processing` colgados
- [ ] ADR de **resilience** (hoy marcado N/A en runtime)

## Fase 3 — UI

- [ ] Pantalla de **ingestas**: lista, estado, progreso, descarga de `rejected.csv`
- [ ] Wizard de ingesta: upload → mapper de columnas → confirmar template → **check "analizar al terminar"**
- [ ] CRUD de **templates** (prompt por rubro)
- [ ] Vista del **insight por contacto** (recomendación de la IA) + estado (`queued`/`processing`/`done`/`failed` + `lastError`)
- [ ] Acciones de análisis: **individual** · **batch por filtros** (conditions existentes) · **reintentar** (individual o masivo sobre `failed`)
- [ ] **SVG de validado por canal** según `verificationStatus` (valid→check, invalid→warning, unverified→gris)
- [ ] Regenerar cliente API (kubb) tras los nuevos endpoints

---

## Pendientes (detalle al design / implementación)

- [ ] Detalle fino del **fallback de modelos** (orden, cuándo saltar, agotamiento de cuota diaria)
- [ ] ADRs adicionales a evaluar: `event-contract` (si se expone progreso por SSE)
