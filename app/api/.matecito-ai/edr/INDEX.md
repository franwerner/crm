# Development Decision Records — Índice raíz

Las decisiones están organizadas por **dominio**. Este índice te dice qué dominio mirar; el detalle de cada decisión está en el índice de su dominio.

## Cómo usar este índice

1. Identificá qué tipo de tarea estás por hacer.
2. Encontrá el dominio correspondiente abajo y abrí su `INDEX.md`.
3. Leé los EDRs relevantes antes de escribir código.
4. Si hay contradicción entre tu plan y un EDR: pará y preguntale al usuario.

## Dominios de este proyecto

(Solo se listan los dominios que tienen al menos un EDR-archivo.)

| Dominio | Qué agrupa | Índice |
|---|---|---|
| `context` | Marco del proyecto: qué se construye, stack, equipo, alcance, madurez. | [context/INDEX.md](context/INDEX.md) |
| `structure` | Estilo arquitectónico (Vertical Slice), capas y reglas de dependencia, comunicación entre capas, organización de carpetas, read models para listas, resolución de IDs cross-slice. | [structure/INDEX.md](structure/INDEX.md) |
| `runtime` | Comportamiento en ejecución: manejo de errores (RFC 7807, boundary global), trabajos asíncronos, resiliencia. | [runtime/INDEX.md](runtime/INDEX.md) |
| `data` | Persistencia y datos: acceso a datos y transacciones, convenciones de modelado, object storage. | [data/INDEX.md](data/INDEX.md) |
| `observability` | Visibilidad operacional: logging. | [observability/INDEX.md](observability/INDEX.md) |
| `security` | Autenticación, CSRF y manejo de secretos. | [security/INDEX.md](security/INDEX.md) |
| `delivery` | Ensamblado, configuración y prueba: inyección de dependencias, carga/validación de config, estrategia de testing. | [delivery/INDEX.md](delivery/INDEX.md) |
| `contracts` | Contrato externo de la API: OpenAPI y wire format de listados (paginación, filtros, sort). | [contracts/INDEX.md](contracts/INDEX.md) |
| `domain-logic` | Reglas de negocio del CRM: máquina de estados del pipeline de Contact. | [domain-logic/INDEX.md](domain-logic/INDEX.md) |
| `integration` | Bordes de integración con sistemas externos: contratos de puerto, credenciales, timeouts y mapeo de errores externos. | [integration/INDEX.md](integration/INDEX.md) |
| `tech` | Tecnologías concretas elegidas (runtime, framework, DB, ORM, etc.) con su "por qué". | [tech/INDEX.md](tech/INDEX.md) — **consultá siempre antes de instalar algo nuevo** |

**Leyenda de status:** `Accepted` = vigente · `Pending` = decidir más adelante · `Not Applicable` = decidido que no aplica · `Deferred` = postergado con condición · `Superseded` = reemplazado por otro EDR.

> Para EDRs `Pending`/`Deferred`, leé la sección "Razón de omisión / aplazamiento" del archivo; para los `Not Applicable`, la razón está en la sección "No aplican" del INDEX del dominio (o "Dominios sin uso" del raíz). **No asumas que la falta de decisión es un olvido** — está documentada.

## Dominios sin uso en este proyecto

(Dominios cuyas fases quedaron todas `Not Applicable` — no tienen carpeta. Se listan acá para dejar constancia de que se consideraron.)

| Dominio | Razón |
|---|---|
| `frontend` | `app/api` no tiene UI propia (el frontend es `app/ui`, paquete autónomo). |
| `quality` | Sin requisitos de NFR formalizados todavía (performance, disponibilidad, límites de carga). |
| `lifecycle` | Sin políticas de ciclo de vida de datos/entidades formalizadas aún. |
| `privacy` | Sin política de privacidad/retención de PII formalizada (más allá del scrubbing de logs en `runtime/error-handling.md`). |
| `release` | Sin estrategia de release/deploy/versionado documentada todavía. |
| `compliance` | Sin requisitos regulatorios formalizados. |
| `ux-product` | Sin decisiones de producto/UX a este nivel (viven en el PRD, no como EDRs de `app/api`). |

## Estado y mantenimiento

- Última actualización: 2026-07-10
- **Actualizar una decisión (cambio menor):** editá el EDR. El historial lo lleva git.
- **Cambiar una decisión (cambio de fondo):** creá un EDR nuevo en el mismo dominio, marcá el viejo `Superseded` con link al nuevo. No edites la decisión vieja en el lugar.
- **Decisión nueva:** creá el EDR en su dominio y sumá la fila al índice de ese dominio (y, si el dominio es nuevo en el proyecto, a este índice raíz).
