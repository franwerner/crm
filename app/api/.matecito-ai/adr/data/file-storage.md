# ADR — Storage de archivos (object storage)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-26
- **Última actualización:** 2026-05-26 (lifecycle revisado: hard delete coordinado DB → MinIO; estrategia de bucket corregida: pre-existencia obligatoria porque Bun.S3Client no expone createBucket); 2026-06-12 (storage extraído a capability compartida src/shared/storage/: port ObjectStorage + adapter Bun único vía DI; el prefijo de key y la policy per-resource quedan en el slice consumidor); 2026-06-17 (variante config-driven per-slice: un slice puede definir su límite de tamaño vía variable de entorno en lugar de constante fija)
- **Decisores:** ifran
- **Fase:** file-storage

## Contexto

El módulo `projects` (y previsiblemente otros futuros: contratos, comprobantes, adjuntos genéricos) necesita almacenar archivos binarios asociados a entidades del dominio. La base de datos relacional (`data-access.md`) no es el lugar correcto para blobs: degrada backups, escala mal y mezcla responsabilidades.

Se necesita un mecanismo de object storage S3-compatible que:

- corra en dev sin depender de un proveedor cloud,
- en prod pueda apuntar a un S3 real (AWS S3, R2, etc.) sin cambiar código,
- se acceda solo desde la capa de infraestructura (mismo principio de encapsulación que los repositorios — `../structure/layers-and-dependencies.md` #4),
- valide tipo y tamaño server-side antes de aceptar uploads.

## Decisión

### Producto y cliente

- **Storage:** **MinIO** auto-hosteado (S3-compatible) en `docker-compose.yml` para dev. En prod se cambia el endpoint a un S3 real sin cambios de código. Ver `../tech/minio.md`.
- **Cliente:** **`Bun.s3` nativo** (`S3Client` integrado en Bun ≥ 1.2). Cero dependencias npm — usa la API S3 estándar. Funciona contra MinIO o AWS S3 cambiando solo el endpoint en config.

### Encapsulación (regla #4 de `../structure/layers-and-dependencies.md` aplicada a storage)

- `Bun.s3` y toda referencia a S3 vive SOLO dentro del adapter de la capability compartida `src/shared/storage/object-storage.bun.ts`. Prohibido usar `Bun.s3` desde cualquier slice (`domain/`, `application/`, `http/`, `infrastructure/`).
- El object storage es una **capability compartida**: un único puerto genérico `ObjectStorage` (`src/shared/storage/object-storage.ts`) y un único adapter `BunObjectStorage` (`src/shared/storage/object-storage.bun.ts`), expuestos por `@shared/storage`. Los slices NO declaran puertos/adapters de storage propios — consumen `ObjectStorage` por DI. Cada slice mantiene como concern propio: (a) la construcción del prefijo de key (`{module}/{entity}/...`) en su `domain/`, y (b) sus constantes de policy per-resource (tamaño/MIME/TTL) en su `domain/constants.ts`.
- La **mecánica de naming de keys** (sanitización del filename y ensamblado `{prefix}/{id}-{name}`) es genérica y vive en la capability compartida: `src/shared/storage/storage-key.ts` exporta `sanitizeObjectName(rawName)` y `buildObjectKey(prefix, id, rawName)` (vía `@shared/storage`). El slice solo aporta su prefijo en un wrapper delgado en su `application/` (ej. `projects/application/document-storage-key.ts`) — NO en `domain/`, porque consumir `@shared/storage` desde `domain/` violaría la pureza de dominio (regla #1 de `../structure/layers-and-dependencies.md`: el domain puro solo importa de su propio domain + `shared/errors`). Así la convención de naming es única y reusable; el slice no reimplementa el regexp ni el ensamblado.
- El use-case nunca ve URLs presigned, keys de bucket ni endpoints — recibe streams/buffers o referencias abstractas vía el puerto.

### Estrategia de buckets

- Un bucket por ambiente, configurable vía `MINIO_BUCKET` (ej. `crm-files-dev`, `crm-files-prod`). No se segmentan buckets por módulo — la segmentación es por prefijo de key (ver más abajo).
- **El bucket debe pre-existir** — no se crea desde el adapter. `Bun.S3Client` (el cliente nativo elegido en `../tech/minio.md`) NO expone una operación `createBucket`, así que el bootstrap del bucket es responsabilidad externa al runtime de la API:

- **Dev**: lo crea automáticamente el init container `minio-init` (`minio/mc`) del `docker-compose.yml`: corre `mc mb --ignore-existing local/$MINIO_BUCKET` tras el healthcheck de minio y la API espera su `service_completed_successfully` antes de arrancar (el primer upload nunca falla por bucket ausente). Idempotente. Manual como fallback: `docker compose exec minio mc mb local/$MINIO_BUCKET`.
- **Prod**: script de bootstrap de infra (CI/CD, terraform, helm, lo que aplique al deploy). El bucket debe existir antes del primer write de la API.

Si la API intenta escribir contra un bucket inexistente, falla con un error genérico de S3 (NO tipado como `NoSuchBucket` que podríamos atrapar para auto-crear). El comportamiento es ruidoso por diseño: indica que falta un paso de bootstrap.

### Naming de keys

Convención obligatoria:

```
{module}/{entity}/{entityId}/{fileId}-{filename}
```

Ejemplo: `projects/documents/proj_01HZ.../doc_01HZ...-contrato-marco-firmado.pdf`

- `module` y `entity` en plural minúsculas (alineado con tablas DB — `data-modeling.md`).
- `entityId` es el ID del agregado dueño del archivo (UUID v7 — `src/shared/utils/id.ts`).
- `fileId` es UUID v7 generado al subir (mismo `newId()` del shared kit).
- `filename` es el nombre original sanitizado (caracteres no-ASCII y `/` reemplazados por `-`, longitud máx. 200 chars).

Beneficios: predecible para debugging, permite listados por prefijo en operaciones admin, separa archivos por entidad para borrado en cascada.

### Patrón de acceso

- **Upload:** proxy a través de la API (cliente → API → MinIO). La API valida tamaño y MIME antes de aceptar la subida. NO se usan presigned URLs para upload — perderíamos validación server-side.
- **Download:** **presigned URL temporal** (GET) generada por el adapter, devuelta al cliente; expiración 15 minutos. El cliente baja el archivo directo desde MinIO sin pasar por la API.

#### Generación de presign: per-slice, NO un endpoint core unificado

La **mecánica** de firmar es compartida (`getPresignedDownloadUrl` en `@shared/storage`). La **exposición** del presign (endpoint + use-case) vive en **cada slice dueño del recurso**, no en un endpoint core genérico. Cada feature con archivos expone su propio `GET /<feature>/.../download-url`, que resuelve su key y aplica su autorización (ownership + permisos del usuario), y delega solo el firmado a `@shared/storage`. Análogo a `projects/.../download-url`.

Razones del rechazo a un endpoint core con listado hardcodeado de features:
- La **autorización y la resolución de la key son per-feature** (distinta tabla, distinto ownership, distintos permisos). Un core con `switch(feature)` tendría que conocer todos los slices → los acopla y **rompe el aislamiento de vertical slices** (regla #5/#6 de `../structure/layers-and-dependencies.md`).
- El stack es **contract-first** (OpenAPI + kubb): un endpoint por feature da tipos y contratos claros en el front; un endpoint polimórfico (`feature: string`) degrada el tipado generado.
- La "duplicación" entre slices (buscar recurso → validar → `storage.presign`) es mínima y **buena**: cada slice controla su acceso.

**Evolución (si escala a muchos features con archivos):** unificar el endpoint **solo** vía un **registry de resolvers** —el core define un puerto `PresignResolver` y cada slice registra el suyo por DI (dependencia invertida, el core no conoce los slices)— NUNCA un `switch`/listado hardcodeado. No implementar hasta que la cantidad de features lo justifique.

### Límites

| Constante | Valor | Razón |
|---|---|---|
| `MAX_FILE_SIZE_BYTES` | 25 · 1024 · 1024 (25 MB) | Suficiente para contratos, presupuestos, imágenes; cap razonable contra abusos. |
| `PRESIGNED_DOWNLOAD_TTL_SECONDS` | 900 (15 min) | Suficiente para iniciar la descarga en un click sin dejar URLs vivas indefinidamente. |

Se exportan desde el `domain/constants.ts` del slice consumidor (per-resource policy). NO viven en la capability compartida — `src/shared/storage/` es agnóstico de límites de negocio.

#### Variante config-driven per-slice (Accepted — 2026-06-17)

Un slice puede definir su límite de tamaño vía variable de entorno en lugar de una constante fija, cuando el caso de uso lo requiera (p. ej. archivos grandes con streaming donde el límite es operacional, no de RAM).

Reglas para la variante:
- La variable de entorno se valida con zod en `src/shared/config` (junto con el resto de la config de la app). NO se lee directamente del entorno fuera de ese módulo.
- El valor resultante se pasa como config al bootstrap del slice y se aplica en la **capa HTTP** — coherente con la regla ya existente "MIME y tamaño se validan en la capa HTTP".
- El **dominio del slice sigue siendo puro**: no lee variables de entorno, no importa `@shared/config`.
- La constante en `domain/constants.ts` sigue siendo válida para slices con un límite fijo conocido; la variante config-driven es un override opt-in por slice.

Ejemplo: el módulo `imports` usa `IMPORT_MAX_FILE_SIZE_MB` (env, default `50`). Con streaming, la RAM se desacopla del tamaño del archivo, por lo que el límite de 50 MB es operacional (cap de disco temporal + tiempo + anti-abuso), no de memoria.

### MIME whitelist

Tipos aceptados (lista cerrada):

- `application/pdf`
- `image/jpeg`, `image/png`, `image/webp`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (xlsx)
- `text/plain`

Cualquier otro tipo se rechaza con `ValidationError` (400 — `../runtime/error-handling.md`). La lista se amplía solo via update a este ADR.

### Lifecycle

**Hard delete coordinado DB → MinIO** (la decisión soft-vs-hard delete es per-resource y se toma deliberadamente; para documentos se eligió hard). El DELETE elimina la fila de metadata y el objeto en MinIO en el mismo use-case:

1. DELETE de la fila en `project_documents` (transacción Postgres).
2. Si (1) commitea: DELETE del objeto en MinIO (idempotente).
3. Si (2) falla post-commit: el adapter loggea WARN con el `storage_key`; el objeto queda huérfano puntual (limpieza manual eventual). La metadata ya no existe, así que la consistencia visible al usuario está garantizada (`200 OK` significa "esta metadata ya no está").

Justificación del orden DB → MinIO: priorizar consistencia visible al usuario. El orden inverso (MinIO → DB) dejaría metadata apuntando a un objeto inexistente si el segundo paso falla — peor UX (404 al intentar descargar) que un objeto huérfano (invisible al usuario).

Sin políticas automáticas de expiración por TTL: los objetos viven mientras exista metadata correspondiente. La integridad la garantiza el flujo de hard delete; no hay backlog de huérfanos a limpiar por diseño (salvo fallos post-commit, que son excepcionales y trazables vía logs).

### Limpieza de huérfanos (mejora DIFERIDA — no implementada)

Hoy el fallo post-commit solo loggea WARN; la limpieza es manual. Cuando se introduzca **Redis** (planeado para la ingesta de contactos y el workflow LLM), la red de seguridad recomendada es una **cola de borrados pendientes**, NO un sweeper que recorra el bucket (fuerza bruta, riesgo de borrar de más por carreras con uploads en curso) ni un lifecycle TTL de S3 (ya descartado arriba: borraría objetos válidos):

- En el `catch` del delete, además del WARN, **encolar el `storage_key`** como un job. Un worker lo reintenta con backoff; tras N intentos → dead-letter para inspección manual. `deleteObject` ya es idempotente, así que reintentar es seguro.
- Reusar la **capability de colas genérica** que introduzca Redis (puerto `JobQueue` + adapter en infra, p. ej. BullMQ sobre Redis Streams; encapsulado como el storage y construido en `app.ts` vía DI). El borrado pendiente es **un tipo de job más**, no una cola dedicada.
- Encolar es **best-effort** (si Redis está caído en ese instante se pierde el registro del huérfano). Suficiente para este caso: los huérfanos son un goteo raro. Solo si la pérdida fuera inaceptable se justificaría un **outbox transaccional** (registrar el pending-deletion en una tabla Postgres dentro de la misma transacción del delete + relay que reintenta) — mayor complejidad, NO recomendado para el volumen esperado.

Esto depende de tres decisiones encadenadas aún no tomadas (Redis como tech, capability de colas genérica, este patrón). Capturar como ADRs propios cuando se arranque Redis.

## Alternativas consideradas

- **AWS S3 hosted desde dev:** costo recurrente, dependencia de credenciales reales en local, fricción para nuevos devs. Descartado: MinIO da la misma API S3 sin esos costos.
- **`@aws-sdk/client-s3`:** SDK externo pesado. Innecesario teniendo `Bun.s3` nativo que cubre exactamente el mismo caso. Descartado.
- **Almacenar archivos en Postgres como `bytea`:** degrada backups, mezcla concerns, escala mal. Descartado.
- **Filesystem local del contenedor:** sin durabilidad bajo recreaciones del contenedor, sin separación de concerns, sin horizontal scaling. Descartado.
- **Upload via presigned URL:** pierde validación server-side de tamaño y MIME. Descartado para upload; aceptado para download.
- **TTL más largo en presigned download (1 hora+):** URLs vivas demasiado tiempo si se filtran. Descartado por security-by-default; 15 min cubre click → download.

## Consecuencias

**Positivas:**

- Mismo cliente (`Bun.s3`) funciona contra MinIO en dev y S3 real en prod cambiando solo el endpoint.
- Cero dependencias npm para storage — alineado con el patrón del repo (Bun-nativo, igual que `hono/jwt` y `Bun.password` en `../security/auth.md`).
- Validación de tipo y tamaño server-side garantizada en upload.
- Keys predecibles facilitan debugging y operaciones admin.

**Negativas / trade-offs:**

- Upload proxy carga la API con el stream del archivo — peor que presigned para archivos muy grandes. El cap de 25 MB amortigua esto; si crece, se reevalúa.
- Riesgo puntual de objeto huérfano si MinIO delete falla DESPUÉS del commit DB — trazable vía logs WARN, limpieza manual eventual.
- MinIO en dev sin pinear (`latest`) acepta cambios silenciosos entre pulls — anotado en `../tech/minio.md`.

## Reglas concretas

- `Bun.s3` SOLO dentro de `src/shared/storage/object-storage.bun.ts`. Prohibido en cualquier slice.
- Storage es capability compartida: puerto `ObjectStorage` + adapter `BunObjectStorage` en `src/shared/storage/`, consumidos vía `@shared/storage` por DI. El adapter se construye UNA vez en `src/app.ts` y se inyecta a cada `bootstrap*` que lo necesite.
- Naming de keys: `{module}/{entity}/{entityId}/{fileId}-{filename}` — no cambia sin actualizar este ADR; el prefijo lo construye el slice consumidor (no la capability), byte-idéntico a la convención.
- Upload pasa SIEMPRE por la API (validación server-side). Download usa presigned URL con TTL fijo.
- MIME y tamaño se validan en la capa HTTP (zod) antes de invocar al use-case.
- DELETE de documento es **hard**: borra fila DB primero, después objeto MinIO. Si MinIO falla post-commit, loggear WARN con el `storage_key`. NO hay soft delete para documentos.
