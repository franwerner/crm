# ADR — Storage de archivos (object storage)

- **Status:** Accepted
- **Fecha de creación:** 2026-05-26
- **Última actualización:** 2026-05-26 (lifecycle revisado: hard delete coordinado DB → MinIO; estrategia de bucket corregida: pre-existencia obligatoria porque Bun.S3Client no expone createBucket)
- **Decisores:** ifran
- **Fase:** file-storage

## Contexto

El módulo `projects` (y previsiblemente otros futuros: contratos, comprobantes, adjuntos genéricos) necesita almacenar archivos binarios asociados a entidades del dominio. La base de datos relacional (`data-access.md`) no es el lugar correcto para blobs: degrada backups, escala mal y mezcla responsabilidades.

Se necesita un mecanismo de object storage S3-compatible que:

- corra en dev sin depender de un proveedor cloud,
- en prod pueda apuntar a un S3 real (AWS S3, R2, etc.) sin cambiar código,
- se acceda solo desde la capa de infraestructura (mismo principio de encapsulación que los repositorios — `layers-and-dependencies.md` #4),
- valide tipo y tamaño server-side antes de aceptar uploads.

## Decisión

### Producto y cliente

- **Storage:** **MinIO** auto-hosteado (S3-compatible) en `docker-compose.yml` para dev. En prod se cambia el endpoint a un S3 real sin cambios de código. Ver `tech/minio.md`.
- **Cliente:** **`Bun.s3` nativo** (`S3Client` integrado en Bun ≥ 1.2). Cero dependencias npm — usa la API S3 estándar. Funciona contra MinIO o AWS S3 cambiando solo el endpoint en config.

### Encapsulación (regla #4 de `layers-and-dependencies.md` aplicada a storage)

- `Bun.s3` y toda referencia a S3 vive SOLO dentro de `*/infrastructure/*` del slice consumidor. Prohibido importar `Bun.s3` desde `domain/`, `application/` o `http/`.
- Cada slice que necesite storage declara su puerto `*.storage.ts` en `domain/` (interface) y su adapter `*.storage.bun.ts` en `infrastructure/`. Análogo al patrón `*.repository.ts` / `*.repository.bun.ts` de `data-access.md`.
- El use-case nunca ve URLs presigned, keys de bucket ni endpoints — recibe streams/buffers o referencias abstractas vía el puerto.

### Estrategia de buckets

- Un bucket por ambiente, configurable vía `MINIO_BUCKET` (ej. `crm-files-dev`, `crm-files-prod`). No se segmentan buckets por módulo — la segmentación es por prefijo de key (ver más abajo).
- **El bucket debe pre-existir** — no se crea desde el adapter. `Bun.S3Client` (el cliente nativo elegido en `tech/minio.md`) NO expone una operación `createBucket`, así que el bootstrap del bucket es responsabilidad externa al runtime de la API:

- **Dev**: crear manualmente vía la CLI `mc` (incluida en la imagen oficial de MinIO): `docker compose exec minio mc mb local/$MINIO_BUCKET` (o `mc mb local/crm-files` para el default).
- **Prod**: script de bootstrap de infra (CI/CD, terraform, helm, lo que aplique al deploy). El bucket debe existir antes del primer write de la API.

Si la API intenta escribir contra un bucket inexistente, falla con un error genérico de S3 (NO tipado como `NoSuchBucket` que podríamos atrapar para auto-crear). El comportamiento es ruidoso por diseño: indica que falta un paso de bootstrap.

### Naming de keys

Convención obligatoria:

```
{module}/{entity}/{entityId}/{fileId}-{filename}
```

Ejemplo: `projects/documents/proj_01HZ.../doc_01HZ...-contrato-marco-firmado.pdf`

- `module` y `entity` en plural minúsculas (alineado con tablas DB — `data-modeling-conventions.md`).
- `entityId` es el ID del agregado dueño del archivo (UUID v7 — `src/shared/utils/id.ts`).
- `fileId` es UUID v7 generado al subir (mismo `newId()` del shared kit).
- `filename` es el nombre original sanitizado (caracteres no-ASCII y `/` reemplazados por `-`, longitud máx. 200 chars).

Beneficios: predecible para debugging, permite listados por prefijo en operaciones admin, separa archivos por entidad para borrado en cascada.

### Patrón de acceso

- **Upload:** proxy a través de la API (cliente → API → MinIO). La API valida tamaño y MIME antes de aceptar la subida. NO se usan presigned URLs para upload — perderíamos validación server-side.
- **Download:** **presigned URL temporal** (GET) generada por el adapter, devuelta al cliente; expiración 15 minutos. El cliente baja el archivo directo desde MinIO sin pasar por la API.

### Límites

| Constante | Valor | Razón |
|---|---|---|
| `MAX_FILE_SIZE_BYTES` | 25 · 1024 · 1024 (25 MB) | Suficiente para contratos, presupuestos, imágenes; cap razonable contra abusos. |
| `PRESIGNED_DOWNLOAD_TTL_SECONDS` | 900 (15 min) | Suficiente para iniciar la descarga en un click sin dejar URLs vivas indefinidamente. |

Se exportan desde el shared kit del storage (ubicación definida cuando se implemente el primer adapter en F4).

### MIME whitelist

Tipos aceptados (lista cerrada):

- `application/pdf`
- `image/jpeg`, `image/png`, `image/webp`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (xlsx)
- `text/plain`

Cualquier otro tipo se rechaza con `ValidationError` (400 — `error-handling.md`). La lista se amplía solo via update a este ADR.

### Lifecycle

**Hard delete coordinado DB → MinIO** (la decisión soft-vs-hard delete es per-resource y se toma deliberadamente; para documentos se eligió hard). El DELETE elimina la fila de metadata y el objeto en MinIO en el mismo use-case:

1. DELETE de la fila en `project_documents` (transacción Postgres).
2. Si (1) commitea: DELETE del objeto en MinIO (idempotente).
3. Si (2) falla post-commit: el adapter loggea WARN con el `storage_key`; el objeto queda huérfano puntual (limpieza manual eventual). La metadata ya no existe, así que la consistencia visible al usuario está garantizada (`200 OK` significa "esta metadata ya no está").

Justificación del orden DB → MinIO: priorizar consistencia visible al usuario. El orden inverso (MinIO → DB) dejaría metadata apuntando a un objeto inexistente si el segundo paso falla — peor UX (404 al intentar descargar) que un objeto huérfano (invisible al usuario).

Sin políticas automáticas de expiración por TTL: los objetos viven mientras exista metadata correspondiente. La integridad la garantiza el flujo de hard delete; no hay backlog de huérfanos a limpiar por diseño (salvo fallos post-commit, que son excepcionales y trazables vía logs).

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
- Cero dependencias npm para storage — alineado con el patrón del repo (Bun-nativo, igual que `hono/jwt` y `Bun.password` en `auth.md`).
- Validación de tipo y tamaño server-side garantizada en upload.
- Keys predecibles facilitan debugging y operaciones admin.

**Negativas / trade-offs:**

- Upload proxy carga la API con el stream del archivo — peor que presigned para archivos muy grandes. El cap de 25 MB amortigua esto; si crece, se reevalúa.
- Riesgo puntual de objeto huérfano si MinIO delete falla DESPUÉS del commit DB — trazable vía logs WARN, limpieza manual eventual.
- MinIO en dev sin pinear (`latest`) acepta cambios silenciosos entre pulls — anotado en `tech/minio.md`.

## Reglas concretas

- `Bun.s3` SOLO dentro de `*/infrastructure/*` del slice. Prohibido importar `Bun.s3` desde `domain/`, `application/` o `http/`.
- Cada slice que necesite storage declara su puerto `*.storage.ts` en `domain/` y adapter en `infrastructure/`.
- Naming de keys: `{module}/{entity}/{entityId}/{fileId}-{filename}` — no cambia sin actualizar este ADR.
- Upload pasa SIEMPRE por la API (validación server-side). Download usa presigned URL con TTL fijo.
- MIME y tamaño se validan en la capa HTTP (zod) antes de invocar al use-case.
- DELETE de documento es **hard**: borra fila DB primero, después objeto MinIO. Si MinIO falla post-commit, loggear WARN con el `storage_key`. NO hay soft delete para documentos.
