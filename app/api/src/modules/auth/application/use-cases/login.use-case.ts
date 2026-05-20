import { UnauthorizedError } from '../../../../shared/errors'
import type { UsersPublicApi } from '../../../users/public/user.public'

export interface LoginIdentity {
  readonly userId: string
}

export async function login(params: {
  email: string
  password: string
  usersApi: UsersPublicApi
}): Promise<LoginIdentity> {
  const { email, password, usersApi } = params

  const normalizedEmail = email.toLowerCase().trim()

  const user = await usersApi.findByEmail(normalizedEmail)

  if (!user) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const passwordValid = await Bun.password.verify(password, user.passwordHash)

  if (!passwordValid) {
    throw new UnauthorizedError('Invalid credentials')
  }

  return { userId: user.id }
}
