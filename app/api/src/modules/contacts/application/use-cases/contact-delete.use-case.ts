import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import { NotFoundError } from '@shared/errors'

export interface DeleteContactInput {
  id: string
}

export class ContactDeleteUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: DeleteContactInput): Promise<void> {
    const contact = await this.repo.findById(input.id)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.id} not found`)
    }

    const deleted = contact.softDelete(new Date())
    await this.repo.save(deleted)
  }
}
