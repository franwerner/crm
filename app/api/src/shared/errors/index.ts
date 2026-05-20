export interface FieldError {
  field: string
  message: string
}

export abstract class DomainError extends Error {
  abstract readonly status: number
  abstract readonly code: string
  abstract readonly title: string

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = new.target.name
  }
}

export class NotFoundError extends DomainError {
  readonly status = 404
  readonly code = 'not_found'
  readonly title = 'Resource not found'
}

export class ConflictError extends DomainError {
  readonly status = 409
  readonly code = 'conflict'
  readonly title = 'Conflict'
}

export class BusinessRuleError extends DomainError {
  readonly status = 422
  readonly code = 'business_rule'
  readonly title = 'Business rule violation'
}

export class ValidationError extends DomainError {
  readonly status = 400
  readonly code = 'validation_failed'
  readonly title = 'Validation failed'
  readonly fields: FieldError[]

  constructor(message: string, fields: FieldError[] = [], options?: { cause?: unknown }) {
    super(message, options)
    this.fields = fields
  }
}

export class UnauthorizedError extends DomainError {
  readonly status = 401
  readonly code = 'unauthorized'
  readonly title = 'Unauthorized'
}
