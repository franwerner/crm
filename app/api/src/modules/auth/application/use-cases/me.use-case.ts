import { UnauthorizedError } from '@shared/errors'
import type { AuthUserQueries, AuthUserProfile } from '@modules/auth/application/auth-user.query'

export class MeUseCase {
  constructor(private readonly authUsers: AuthUserQueries) {}

  async execute({ userId }: { userId: string }): Promise<AuthUserProfile> {
    const user = await this.authUsers.findProfileById(userId)

    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    return user
  }
}
