import { createRoute, z } from '@hono/zod-openapi'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { ProblemSchema } from '@shared/schemas/problem.schema'
import { ProjectDocumentViewSchema } from '@modules/projects/http/dto/out/project-document.out'
import { ProjectDocumentListResponseSchema } from '@modules/projects/http/dto/out/project-document-list.out'
import { ProjectDocumentDownloadUrlSchema } from '@modules/projects/http/dto/out/project-document-download-url.out'
import { documentListQuerySchema } from '@modules/projects/infrastructure/project.resource'
import type { ProjectController } from '@modules/projects/http/project.controller'

const uploadDocumentRoute = createRoute({
  method: 'post',
  path: '/projects/{id}/documents',
  summary: 'Upload a document to a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    201: {
      description: 'Document uploaded.',
      content: { 'application/json': { schema: ProjectDocumentViewSchema } },
    },
    400: {
      description: 'Invalid file.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const listDocumentsRoute = createRoute({
  method: 'get',
  path: '/projects/{id}/documents',
  summary: 'List documents for a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string() }),
    query: documentListQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated list of documents.',
      content: { 'application/json': { schema: ProjectDocumentListResponseSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const getDocumentDownloadUrlRoute = createRoute({
  method: 'get',
  path: '/projects/{id}/documents/{docId}/download-url',
  summary: 'Get a presigned download URL for a document',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), docId: z.string() }),
  },
  responses: {
    200: {
      description: 'Presigned download URL.',
      content: { 'application/json': { schema: ProjectDocumentDownloadUrlSchema } },
    },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or document not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

const deleteDocumentRoute = createRoute({
  method: 'delete',
  path: '/projects/{id}/documents/{docId}',
  summary: 'Delete a document from a project',
  tags: ['projects'],
  request: {
    params: z.object({ id: z.string(), docId: z.string() }),
  },
  responses: {
    204: { description: 'Document deleted.' },
    401: {
      description: 'Unauthorized.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
    404: {
      description: 'Project or document not found.',
      content: { 'application/problem+json': { schema: ProblemSchema } },
    },
  },
})

export function registerDocumentRoutes(router: OpenAPIHono, controller: ProjectController): void {
  router.openapi(uploadDocumentRoute, (c) => controller.uploadDocument(c) as never)
  router.openapi(listDocumentsRoute, (c) => controller.listDocuments(c) as never)
  router.openapi(getDocumentDownloadUrlRoute, (c) => controller.getDocumentDownloadUrl(c) as never)
  router.openapi(deleteDocumentRoute, (c) => controller.deleteDocument(c) as never)
}
