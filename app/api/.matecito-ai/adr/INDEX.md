# Architecture Decision Records — Índice por dominio (app/api)

Este índice enruta **por dominio**. Cada dominio agrupa las decisiones de un mismo eje (estructura, datos, seguridad, etc.). Identificá el dominio relevante a tu tarea, abrí su `INDEX.md` y leé solo los ADRs que apliquen.

## Cómo usar este índice

1. Identificá qué tipo de tarea estás por hacer.
2. Buscá el dominio correspondiente abajo y abrí su `<dominio>/INDEX.md`.
3. Leé los ADRs listados antes de escribir código.
4. Si hay contradicción entre tu plan y un ADR: pará y preguntale al usuario.

## Dominios con ADRs

### [context/](context/INDEX.md)
Contexto del proyecto: qué se construye, stack, equipo, alcance, madurez. Marco para todo lo demás. **Consultá cuando** necesites entender el tipo de proyecto y sus premisas.

### [structure/](structure/INDEX.md)
Estructura del código: estilo arquitectónico (Vertical Slice), capas y reglas de dependencia, comunicación entre capas, organización de carpetas/naming y read models para listas (CQRS-lite). **Consultá cuando** crees archivos, agregues imports entre capas/slices, diseñes un módulo o toques la organización del código.

### [runtime/](runtime/INDEX.md)
Comportamiento en ejecución: manejo de errores (excepciones, RFC 7807, boundary handling global). **Consultá cuando** tires/atrapes una excepción, definas un error custom o respondas un error desde un endpoint.

### [data/](data/INDEX.md)
Persistencia y datos: acceso a datos (Drizzle + Postgres, repositorios, transacciones), convenciones de modelado (IDs, timestamps, borrado, enums, naming DB) y object storage. **Consultá cuando** escribas queries, definas tablas/migraciones o manejes archivos.

### [observability/](observability/INDEX.md)
Visibilidad operacional: logging (Pending). **Consultá cuando** agregues un log o configures niveles. Hoy sin infraestructura — leé la razón de aplazamiento.

### [security/](security/INDEX.md)
Seguridad: autenticación (JWT en cookie httpOnly, sin roles), CSRF, y manejo de secretos. **Consultá cuando** toques login/permisos/tokens/middleware de auth, o aprovisiones/consumas un secreto.

### [delivery/](delivery/INDEX.md)
Ensamblado, configuración y prueba del sistema: inyección de dependencias/composition root, carga y validación de configuración, y estrategia de testing (Pending). **Consultá cuando** cablees dependencias, agregues una env var o decidas testear algo.

### [contracts/](contracts/INDEX.md)
Contrato externo de la API: documentación/OpenAPI y estándares compartidos del wire format de listados (paginación, filtros, sort). Es lo que `app/ui` consume vía kubb. **Consultá cuando** crees/modifiques endpoints, toques schemas zod del borde o el contrato de listados.

### [domain-logic/](domain-logic/INDEX.md)
Reglas de negocio del dominio del CRM: máquina de estados del pipeline de Contact (event-only). **Consultá cuando** toques transiciones de estado, `EventType`/`PipelineState`, `domain/policies.ts` o `Contact.registerEvent`.

## Catálogo de tecnologías

### [tech/](tech/INDEX.md)
Cross-cutting (NO es un dominio): registro vivo de las tecnologías concretas elegidas (Bun, Hono, Drizzle, Postgres, zod, MinIO, etc.) con su "por qué" y alternativas descartadas. **Consultá SIEMPRE antes de agregar/cambiar una dependencia, lib, framework, DB o herramienta.**

## Dominios sin uso

Dominios canónicos del catálogo que hoy NO tienen ADRs en este paquete:

**Activos pero sin uso todavía:**
- `frontend` — `app/api` no tiene UI propia (el frontend es `app/ui`, paquete autónomo).
- `quality` — sin requisitos de NFR formalizados todavía (performance, disponibilidad, límites de carga).

**Reservados (sin uso):**
- `lifecycle` — sin políticas de ciclo de vida de datos/entidades formalizadas aún.
- `integration` — sin integraciones con sistemas externos por ahora.
- `privacy` — sin política de privacidad/retención de PII formalizada (más allá del scrubbing de logs en `runtime/error-handling.md`).
- `release` — sin estrategia de release/deploy/versionado documentada todavía.
- `compliance` — sin requisitos regulatorios formalizados.
- `ux-product` — sin decisiones de producto/UX a este nivel (viven en el PRD, no como ADRs de `app/api`).

> `domain-logic` SÍ está en uso (ver arriba).

## Leyenda de status

`Accepted` = decisión vigente · `Pending` = decidir más adelante · `Not Applicable` = decidido conscientemente que no aplica · `Deferred` = postergado con condición de revisión · `Superseded` = reemplazado por otro ADR.

> Para los ADRs con status distinto de `Accepted`, leer la sección "Razón de omisión / aplazamiento" del archivo correspondiente. **No asumas que la falta de decisión es un olvido** — está documentada.

## Decisiones aplazadas (revisar en modo `update`)

| Origen | Qué falta decidir | Trigger esperado |
|---|---|---|
| `delivery/testing-strategy.md` | Estrategia de testing completa | Cuando haya lógica de negocio no trivial · **además: conflicto con `Strict TDD Mode: enabled` del harness** |
| `observability/logging.md` | Estrategia de logging | Cuando se opere en entorno real / deje de ser prototipo local |
| `structure/inter-layer-communication.md` §3.2 | Eventos de dominio in-process | Cuando la orquestación cross-slice ensucie el composition root |
| `data/data-access.md` §tx | Port de Unit of Work | Cuando un use-case necesite atomicidad sobre más de un repo |
| `security/auth.md` §refresh | Refresh token + rotación | Cuando sesiones largas o revocación sean requisito real |
| `contracts/pagination.md` §cursor | Paginación cursor-based | Cuando offset no escale o el ordenamiento haga inestable la paginación offset |
| `security/secrets-management.md` | Secret manager dedicado | Cuando se planifique producción seria (rotación, auditoría de acceso) |

## Estado y mantenimiento

- Última actualización: 2026-06-01
- Cada ADR tiene su propio `Status:`.
- **Actualizar una decisión (cambio menor):** editá el ADR. El historial lo lleva git.
- **Cambiar una decisión (cambio de fondo):** creá un ADR nuevo, marcá el viejo `Superseded` con link al nuevo. No edites la decisión vieja en el lugar.
- **Decisión nueva:** creá el ADR en el dominio que corresponda y sumá fila al `<dominio>/INDEX.md` (y, si es un dominio nuevo, una sección en este índice raíz).
- **Resolver un Pending:** en modo `update`, recorré las preguntas de esa fase, cambiá Status a `Accepted`, llená el contenido.
