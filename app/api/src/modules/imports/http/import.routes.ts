import { createRoute, z } from '@hono/zod-openapi'
import { OpenAPIHono } from '@hono/zod-openapi'
import { authMiddleware } from '@shared/http/auth-middleware'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { PaginationQuerySchema } from '@shared/schemas/pagination.schema'
import { SetMappingBodySchema } from '@modules/imports/http/dto/in/import-set-mapping.in'
import { ImportUploadResponseSchema } from '@modules/imports/http/dto/out/import-upload.out'
import { ImportSetMappingResponseSchema } from '@modules/imports/http/dto/out/import-set-mapping.out'
import { ImportStatusResponseSchema } from '@modules/imports/http/dto/out/import-status.out'
import { ImportListResponseSchema } from '@modules/imports/http/dto/out/import-list.out'
import type { ImportsController } from '@modules/imports/http/import.controller'

// GET /imports — paginated list of imports, newest first.
const listImportsRoute = createRoute({
  method: 'get',
  path: '/imports',
  summary: 'List imports (paginated)',
  tags: ['imports'],
  request: {
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of imports, newest first.',
      content: { 'application/json': { schema: ImportListResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

// POST /imports — upload xlsx, receive column header preview (D10).
const uploadImportRoute = createRoute({
  method: 'post',
  path: '/imports',
  summary: 'Upload an xlsx file and start an import',
  tags: ['imports'],
  responses: {
    201: {
      description: 'Import created. Returns detected column headers for mapping.',
      content: { 'application/json': { schema: ImportUploadResponseSchema } },
    },
    400: {
      description: 'Invalid file (wrong MIME, size exceeded, or missing file field).',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

// PATCH /imports/{id}/mapping — set column→field mapping, transition to pending, enqueue job.
const setMappingRoute = createRoute({
  method: 'patch',
  path: '/imports/{id}/mapping',
  summary: 'Define the column-to-field mapping for an import',
  tags: ['imports'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      required: true,
      content: { 'application/json': { schema: SetMappingBodySchema } },
    },
  },
  responses: {
    200: {
      description: 'Mapping saved. Import is now pending.',
      content: { 'application/json': { schema: ImportSetMappingResponseSchema } },
    },
    400: {
      description: 'Incomplete or invalid mapping.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Import not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

// GET /imports/{id} — poll import status / progress (D10, R6.1–R6.3).
const getImportStatusRoute = createRoute({
  method: 'get',
  path: '/imports/{id}',
  summary: 'Get the current status and progress of an import',
  tags: ['imports'],
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      description: 'Import status with progress counters and optional rejected.csv link.',
      content: { 'application/json': { schema: ImportStatusResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Import not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

export function createImportsRouter(controller: ImportsController): OpenAPIHono {
  const router = new OpenAPIHono()

  router.use('*', authMiddleware)

  router.openapi(listImportsRoute, (c) => controller.listImports(c) as never)
  router.openapi(uploadImportRoute, (c) => controller.uploadImport(c) as never)
  router.openapi(setMappingRoute, (c) => controller.setMapping(c) as never)
  router.openapi(getImportStatusRoute, (c) => controller.getImportStatus(c) as never)

  return router
}
