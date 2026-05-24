import { User } from '@modules/users/domain/user'
import type { UsersRepository } from '@modules/users/domain/user.repository'
import { ConflictError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface CreateUserInput {
  email: string
  name: string
  password: string
}

export class UserCreateUseCase {
  constructor(private readonly repo: UsersRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const normalizedEmail = input.email.toLowerCase().trim()

    const existing = await this.repo.findByEmail(normalizedEmail)
    if (existing) {
      throw new ConflictError(`Email ${normalizedEmail} is already registered`)
    }

    const now = new Date()
    const passwordHash = await Bun.password.hash(input.password)

    const user = User.create({
      id: newId(),
      email: normalizedEmail,
      name: input.name,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    })

    await this.repo.save(user)
    return user
  }
}
