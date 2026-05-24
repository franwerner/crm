import { UnauthorizedError } from '@shared/errors'
import type { UsersPublicApi } from '@modules/users/public/user.public'

export interface LoginInput {
  email: string
  password: string
}

export interface LoginIdentity {
  readonly userId: string
}

export class LoginUseCase {
  constructor(private readonly usersApi: UsersPublicApi) {}

  async execute(input: LoginInput): Promise<LoginIdentity> {
    const normalizedEmail = input.email.toLowerCase().trim()

    const user = await this.usersApi.findByEmail(normalizedEmail)

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
