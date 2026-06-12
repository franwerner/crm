# MinIO

- **Categoría:** Object storage (S3-compatible)
- **Versión:** image tag `minio/minio:latest` (sin pinear — decisión consciente para dev, ver Notas)
- **Status:** Accepted
- **Decidido en fase:** file-storage
- **Fecha:** 2026-05-26

## Por qué la elegimos

Object storage S3-compatible auto-hosteado: corre en contenedor con docker-compose, expone la misma API S3 estándar, y nos permite usar el mismo cliente (`Bun.s3`) tanto en dev (contra MinIO) como en prod (contra AWS S3, R2, etc.) cambiando solo el endpoint. Cero vendor lock-in, cero costo en dev, cero credenciales cloud para nuevos devs. Alineado con la filosofía del repo de evitar SDKs externos cuando la primitiva ya existe (igual que `hono/jwt` y `Bun.password` en `../security/auth.md`).

## Alternativas descartadas

- **AWS S3 hosted en dev:** costo recurrente y dependencia de credenciales reales en local. MinIO da la misma API sin esos costos.
- **Garage / SeaweedFS:** S3-compatibles también, pero ecosistema más chico y menos documentación. MinIO es el estándar de facto para S3 self-hosted.
- **LocalStack:** mocking de AWS completo. Overkill para un caso que solo necesita S3 — más superficie de mantenimiento.

## Notas

- **Cliente: `Bun.s3` NATIVO** (`S3Client` integrado en Bun ≥ 1.2). NO requiere `@aws-sdk/client-s3` ni otro SDK npm. Aunque `bun.md` no menciona explícitamente esta API, está disponible y la adoptamos como cliente único contra cualquier endpoint S3-compatible.
- Endpoint configurado vía env var `MINIO_ENDPOINT` (ver `../delivery/configuration.md` + `src/shared/config/index.ts`).
- Convenciones de buckets, naming de keys, límites de tamaño y MIME whitelist: ver `../data/file-storage.md`.
- En dev se exponen los puertos `9000` (API S3) y `9001` (consola web). Credenciales root en compose: `minio` / `minio12345`. **No reutilizar estas credenciales en prod** — generar access keys scoped vía la consola admin.
- **Sin pinear (`latest`):** decisión del usuario, contrario al patrón de `postgres:16`. Riesgo: cambios silenciosos entre `docker compose pull`. Reevaluar si aparece un breaking change.
- Healthcheck del compose usa `mc ready local` (la CLI `mc` viene incluida en la imagen oficial; el alias `local` es implícito para localhost dentro del contenedor).
