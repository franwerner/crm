import { ValidationError } from '../../../shared/errors'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface UserProps {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly passwordHash: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
}

export class User {
  private readonly props: UserProps

  private constructor(props: UserProps) {
    this.props = props
  }

  static create(params: {
    id: string
    email: string
    name: string
    passwordHash: string
    createdAt: Date
    updatedAt: Date
  }): User {
    if (!params.id.trim()) {
      throw new ValidationError('User id cannot be empty', [
        { field: 'id', message: 'Id is required' },
      ])
    }
    if (!EMAIL_REGEX.test(params.email)) {
      throw new ValidationError('Invalid email format', [
        { field: 'email', message: 'Must be a valid email address' },
      ])
    }
    if (!params.name.trim()) {
      throw new ValidationError('User name cannot be empty', [
        { field: 'name', message: 'Name is required' },
      ])
    }
    if (!params.passwordHash.trim()) {
      throw new ValidationError('Password hash cannot be empty', [
        { field: 'passwordHash', message: 'passwordHash is required' },
      ])
    }

    const props: UserProps = {
      id: params.id,
      email: params.email.toLowerCase().trim(),
      name: params.name.trim(),
      passwordHash: params.passwordHash,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      deletedAt: null,
    }

    return new User(props)
  }

  static reconstitute(props: UserProps): User {
    return new User(props)
  }

  get id(): string { return this.props.id }
  get email(): string { return this.props.email }
  get name(): string { return this.props.name }
  get passwordHash(): string { return this.props.passwordHash }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Date | null { return this.props.deletedAt }

  softDelete(now: Date): User {
    if (this.props.deletedAt !== null) {
      return this
    }

    return new User({
      ...this.props,
      deletedAt: now,
      updatedAt: now,
    })
  }
}
