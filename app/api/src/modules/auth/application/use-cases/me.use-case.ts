import { UnauthorizedError } from '@shared/errors'
import type { UsersPublicApi, UserProfile } from '@modules/users/public/user.public'

export class MeUseCase {
  constructor(private readonly usersApi: UsersPublicApi) {}

  async execute({ userId }: { userId: string }): Promise<UserProfile> {
    const user = await this.usersApi.findById(userId)

    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    return user
  }
}
