import { UnauthorizedError } from '@shared/errors'
import type { AuthUserQueries } from '@modules/auth/application/auth-user.query'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginIdentity {
  readonly userId: string
}

export class LoginUseCase {
  constructor(private readonly authUsers: AuthUserQueries) {}

  async execute(input: LoginInput): Promise<LoginIdentity> {
    const normalizedEmail = input.email.toLowerCase().trim()

    const user = await this.authUsers.findCredentialsByEmail(normalizedEmail)

    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const passwordValid = await Bun.password.verify(input.password, user.passwordHash)

    if (!passwordValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    return { userId: user.id }
  }
}
