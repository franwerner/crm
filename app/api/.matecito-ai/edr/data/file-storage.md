# EDR — Storage de archivos (object storage)

- **Status:** Accepted
- **Type:** decision
- **Date:** 2026-05-26

## Contexto

Un módulo del CRM (y previsiblemente otros futuros: contratos, comprobantes, adjuntos genéricos) necesita almacenar archivos binarios asociados a entidades del dominio. La base de datos relacional no es el lugar correcto para blobs: degrada backups, escala mal y mezcla responsabilidades.

Se necesita un mecanismo de object storage S3-compatible que:

- corra en dev sin depender de un proveedor cloud,
- en prod pueda apuntar a un S3 real (AWS S3, R2, etc.) sin cambiar código,
- se acceda solo desde la capa de infraestructura (mismo principio de encapsulación que los repositorios),
- valide tipo y tamaño server-side antes de aceptar uploads.

## Decisión

### Producto y cliente

- **Storage:** MinIO auto-hosteado (S3-compatible) en dev. En prod se cambia el endpoint a un S3 real sin cambios de código. Ver `../tech/minio.md`.
- **Cliente:** `Bun.s3` nativo (`S3Client` integrado en Bun ≥ 1.2). Cero dependencias npm — usa la API S3 estándar; funciona contra MinIO o AWS S3 cambiando solo el endpoint en config.

### Encapsulación

- Toda referencia a S3 vive SOLO dentro del adapter de la capability compartida de storage. Prohibido usar el cliente S3 desde cualquier slice.
- El object storage es una **capability compartida**: un único puerto genérico y un único adapter, consumidos por DI. Los slices NO declaran puertos/adapters de storage propios. Cada slice mantiene como concern propio: (a) la construcción del prefijo de key en su dominio, y (b) sus constantes de policy per-resource (tamaño/MIME/TTL).
- La **mecánica de naming de keys** (sanitización del filename y ensamblado del prefijo) es genérica y vive en la capability compartida. El slice solo aporta su prefijo en un wrapper delgado en su capa de aplicación —NO en su dominio, porque consumir la capability compartida desde el dominio violaría la pureza (el dominio puro solo importa de su propio dominio + errores compartidos). Así la convención de naming es única y reusable; el slice no reimplementa la sanitización ni el ensamblado.
- El use-case nunca ve URLs presigned, keys de bucket ni endpoints — recibe streams/buffers o referencias abstractas vía el puerto.

### Estrategia de buckets

- Un bucket por ambiente, configurable vía variable de entorno. No se segmentan buckets por módulo — la segmentación es por prefijo de key (ver abajo).
- **El bucket debe pre-existir** — no se crea desde el adapter, porque el cliente nativo elegido no expone una operación de creación de bucket. El bootstrap del bucket es responsabilidad externa al runtime de la API:
  - **Dev:** lo crea automáticamente un init container idempotente que corre tras el healthcheck del storage; la API espera su finalización antes de arrancar (el primer upload nunca falla por bucket ausente).
  - **Prod:** script de bootstrap de infra (CI/CD, terraform, helm, lo que aplique). El bucket debe existir antes del primer write de la API.
- Si la API intenta escribir contra un bucket inexistente, falla con un error genérico de S3 (NO tipado, NO atrapado para auto-crear). Ruidoso por diseño: indica que falta un paso de bootstrap.

### Naming de keys

Convención obligatoria:

```
{module}/{entity}/{entityId}/{fileId}-{filename}
```

- `module` y `entity` en plural minúsculas (alineado con el naming de tablas — `data-modeling.md`).
- `entityId` es el ID del agregado dueño del archivo (UUID v7).
- `fileId` es un UUID v7 generado al subir (mismo generador compartido).
- `filename` es el nombre original sanitizado (no-ASCII y `/` reemplazados por `-`, longitud máx. 200 chars).

Beneficios: predecible para debugging, permite listados por prefijo en operaciones admin, separa archivos por entidad para borrado en cascada.

### Patrón de acceso

- **Upload:** proxy a través de la API (cliente → API → storage). La API valida tamaño y MIME antes de aceptar la subida. NO se usan presigned URLs para upload — perderíamos validación server-side.
- **Download:** presigned URL temporal (GET) generada por el adapter, devuelta al cliente; expiración 15 minutos. El cliente baja el archivo directo del storage sin pasar por la API.

#### Presign: per-slice, NO un endpoint core unificado

La **mecánica** de firmar es compartida. La **exposición** del presign (endpoint + use-case) vive en **cada slice dueño del recurso**, no en un endpoint core genérico. Cada feature con archivos expone su propio endpoint de download-url, que resuelve su key y aplica su autorización (ownership + permisos del usuario), y delega solo el firmado a la capability compartida.

Razones del rechazo a un endpoint core con listado hardcodeado de features:
- La **autorización y la resolución de la key son per-feature** (distinta tabla, distinto ownership, distintos permisos). Un core con `switch(feature)` tendría que conocer todos los slices → los acopla y rompe el aislamiento de vertical slices.
- El stack es **contract-first** (OpenAPI + kubb): un endpoint por feature da tipos y contratos claros; un endpoint polimórfico degrada el tipado generado.
- La "duplicación" entre slices (buscar recurso → validar → firmar) es mínima y buena: cada slice controla su acceso.

**Evolución (si escala a muchos features con archivos):** unificar el endpoint solo vía un **registry de resolvers** —el core define un puerto y cada slice registra el suyo por DI (dependencia invertida, el core no conoce los slices)— NUNCA un `switch`/listado hardcodeado. No implementar hasta que la cantidad de features lo justifique.

### Límites

El límite de tamaño de archivo y el TTL de la presigned de descarga son **policy per-resource**: viven en el slice consumidor, no en la capability compartida (que es agnóstica de límites de negocio). Valores base: 25 MB de tamaño máximo y 15 min de TTL (suficientes para contratos/presupuestos/imágenes e iniciar una descarga en un click, respectivamente, sin dejar URLs vivas indefinidamente).

#### Variante config-driven per-slice

Un slice puede definir su límite de tamaño vía variable de entorno en lugar de una constante fija, cuando el caso lo requiera (p. ej. archivos grandes con streaming, donde el límite es operacional —cap de disco temporal, tiempo, anti-abuso— y no de RAM). Reglas de la variante:
- La variable de entorno se valida con zod en el módulo de config compartido (junto con el resto de la config). NO se lee del entorno fuera de ese módulo.
- El valor resultante se pasa como config al bootstrap del slice y se aplica en la **capa HTTP** — coherente con la regla ya existente "MIME y tamaño se validan en HTTP".
- El **dominio del slice sigue puro**: no lee variables de entorno ni importa la config compartida.
- La constante fija sigue válida para slices con un límite fijo conocido; la variante config-driven es un override opt-in por slice.

### MIME whitelist

Tipos aceptados (lista cerrada, contrato de cara al consumidor):

- `application/pdf`
- `image/jpeg`, `image/png`, `image/webp`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (xlsx)
- `text/plain`

Cualquier otro tipo se rechaza con `ValidationError` (400). La lista se amplía solo vía update a este EDR.

### Lifecycle

**Hard delete coordinado DB → storage** (la decisión soft-vs-hard es per-resource; para documentos se eligió hard). El DELETE elimina la fila de metadata y el objeto en el mismo use-case:

1. DELETE de la fila de metadata (transacción Postgres).
2. Si (1) commitea: DELETE del objeto en el storage (idempotente).
3. Si (2) falla post-commit: el adapter loggea WARN con la key; el objeto queda huérfano puntual (limpieza manual eventual). La metadata ya no existe, así que la consistencia visible al usuario está garantizada.

Justificación del orden DB → storage: priorizar consistencia visible al usuario. El orden inverso dejaría metadata apuntando a un objeto inexistente si el segundo paso falla — peor UX (404 al descargar) que un objeto huérfano (invisible al usuario).

Sin políticas automáticas de expiración por TTL: los objetos viven mientras exista su metadata. La integridad la garantiza el flujo de hard delete; no hay backlog de huérfanos a limpiar por diseño (salvo fallos post-commit, excepcionales y trazables vía logs).

### Limpieza de huérfanos (mejora DIFERIDA — no implementada)

Hoy el fallo post-commit solo loggea WARN; la limpieza es manual. Cuando se introduzca Redis (planeado para la ingesta de contactos y el workflow LLM), la red de seguridad recomendada es una **cola de borrados pendientes**, NO un sweeper que recorra el bucket (fuerza bruta, riesgo de borrar de más por carreras con uploads en curso) ni un lifecycle TTL de S3 (ya descartado: borraría objetos válidos):

- En el `catch` del delete, además del WARN, **encolar la key** como job. Un worker la reintenta con backoff; tras N intentos → dead-letter para inspección manual. El borrado ya es idempotente, así que reintentar es seguro.
- Reusar la **capability de colas genérica** que introduzca Redis (puerto de cola + adapter en infra, encapsulado como el storage y construido por DI). El borrado pendiente es un tipo de job más, no una cola dedicada.
- Encolar es **best-effort** (si Redis está caído en ese instante se pierde el registro del huérfano). Suficiente para un goteo raro de huérfanos. Solo si la pérdida fuera inaceptable se justificaría un **outbox transaccional** (registrar el pending-deletion en Postgres dentro de la misma transacción + relay que reintenta) — mayor complejidad, NO recomendado para el volumen esperado.

Depende de tres decisiones encadenadas aún no tomadas (Redis como tech, capability de colas genérica, este patrón). Capturar como EDRs propios al arrancar Redis.

## Alcance

- `src/shared/storage/**` — capability compartida de object storage: puerto, adapter y mecánica de naming de keys. Única sede de referencias a S3.
- `src/modules/**/domain/constants.ts` — constantes de policy per-resource del slice (tamaño/MIME/TTL fijos).
- `src/modules/**/application/*storage-key*.ts` — wrapper delgado que aporta el prefijo de key del slice.

## Reglas verificables

- **[tool: dependency-cruiser]** el cliente S3 (`Bun.s3`) solo se importa desde `src/shared/storage/object-storage.bun.ts`; prohibido en cualquier slice (`domain/`, `application/`, `http/`, `infrastructure/`).
- **[manual]** el storage es capability compartida (puerto `ObjectStorage` + adapter `BunObjectStorage` en `src/shared/storage/`), consumida vía `@shared/storage` por DI; el adapter se construye una vez en `src/app.ts` y se inyecta a cada bootstrap que lo necesite. Los slices no declaran puerto/adapter de storage propio.
- **[manual]** la convención de key es `{module}/{entity}/{entityId}/{fileId}-{filename}`; el prefijo lo construye el slice consumidor (byte-idéntico), no la capability. No cambia sin actualizar este EDR.
- **[manual]** el prefijo de key se construye en la capa de aplicación del slice, nunca en `domain/` (pureza de dominio).
- **[manual]** upload siempre pasa por la API; MIME y tamaño se validan server-side en la capa HTTP (zod) antes de invocar al use-case. Download usa presigned URL con TTL fijo.
- **[manual]** límite de tamaño base 25 MB (`MAX_FILE_SIZE_BYTES`) y TTL de presigned download 15 min (`PRESIGNED_DOWNLOAD_TTL_SECONDS`); viven en el `domain/constants.ts` del slice, no en la capability compartida. Un slice puede overridear el tamaño vía env var validada en `src/shared/config` y aplicada en HTTP.
- **[manual]** MIME whitelist cerrada (pdf, jpeg, png, webp, docx, xlsx, text/plain); cualquier otro tipo → `ValidationError` (400).
- **[manual]** DELETE de documento es hard: borra la fila de metadata primero, luego el objeto. Si el storage falla post-commit, loggear WARN con la key. Sin soft-delete para documentos.

## Alternativas consideradas

- **AWS S3 hosted desde dev:** costo recurrente, credenciales reales en local, fricción para nuevos devs. Descartado: MinIO da la misma API S3 sin esos costos.
- **`@aws-sdk/client-s3`:** SDK externo pesado. Innecesario teniendo `Bun.s3` nativo que cubre el mismo caso. Descartado.
- **Archivos en Postgres como `bytea`:** degrada backups, mezcla concerns, escala mal. Descartado.
- **Filesystem local del contenedor:** sin durabilidad bajo recreaciones, sin separación de concerns, sin horizontal scaling. Descartado.
- **Upload via presigned URL:** pierde validación server-side de tamaño y MIME. Descartado para upload; aceptado para download.
- **TTL más largo en presigned download (1 hora+):** URLs vivas demasiado tiempo si se filtran. Descartado por security-by-default; 15 min cubre click → download.

## Consecuencias

**Positivas:**

- El mismo cliente funciona contra MinIO en dev y S3 real en prod cambiando solo el endpoint.
- Cero dependencias npm para storage — alineado con el patrón Bun-nativo del repo.
- Validación de tipo y tamaño server-side garantizada en upload.
- Keys predecibles facilitan debugging y operaciones admin.

**Negativas / trade-offs:**

- El upload proxy carga la API con el stream del archivo — peor que presigned para archivos muy grandes. El cap de 25 MB lo amortigua; si crece, se reevalúa.
- Riesgo puntual de objeto huérfano si el delete del storage falla DESPUÉS del commit DB — trazable vía logs WARN, limpieza manual eventual.
- MinIO en dev sin pinear acepta cambios silenciosos entre pulls — anotado en `../tech/minio.md`.

## Relacionados

- `relacionado-con` → [../structure/layers-and-dependencies.md](../structure/layers-and-dependencies.md) — encapsulación de infraestructura tras adapters.
- `relacionado-con` → [data-modeling.md](data-modeling.md) — naming plural de keys alineado con el naming de tablas.
- `depende-de` → [../tech/minio.md](../tech/minio.md) — storage S3-compatible elegido.
