import { ApiError } from './http-client'

export type Problem = {
  code: string
  title: string
  status: number
  detail: string
  instance: string
}

export function isProblem(value: unknown): value is Problem {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate['code'] === 'string' &&
    typeof candidate['title'] === 'string' &&
    typeof candidate['status'] === 'number' &&
    typeof candidate['detail'] === 'string'
  )
}

export function getProblem(error: unknown): Problem | undefined {
  if (error instanceof ApiError && isProblem(error.body)) return error.body
  if (isProblem(error)) return error
  return undefined
}

export function getStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status
  return getProblem(error)?.status
}

export function toUserMessage(error: unknown): string {
  const problem = getProblem(error)
  if (problem) return problem.detail || problem.title
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}
