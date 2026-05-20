import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'
import { DomainError, ValidationError, type FieldError } from '@shared/errors'

interface ProblemDetails {
  code: string
  title: string
  status: number
  detail: string
  instance: string
  errors?: FieldError[]
}

function problem(c: Context, p: ProblemDetails): Response {
  return c.body(JSON.stringify(p), p.status as ContentfulStatusCode, {
    'content-type': 'application/problem+json',
  })
}

export function errorHandler(err: Error, c: Context): Response {
  const instance = c.req.path

  if (err instanceof DomainError) {
    const p: ProblemDetails = {
      code: err.code,
      title: err.title,
      status: err.status,
      detail: err.message,
      instance,
    }
    if (err instanceof ValidationError && err.fields.length > 0) {
      p.errors = err.fields
    }
    return problem(c, p)
  }

  if (err instanceof ZodError) {
    return problem(c, {
      code: 'validation_failed',
      title: 'Validation failed',
      status: 400,
      detail: 'The request did not pass validation.',
      instance,
      errors: err.issues.map((i) => ({
        field: i.path.join('.') || '(root)',
        message: i.message,
      })),
    })
  }

  const errorId = crypto.randomUUID()
  return problem(c, {
    code: 'internal_error',
    title: 'Internal Server Error',
    status: 500,
    detail: `An unexpected error occurred. Reference: ${errorId}`,
    instance,
  })
}
