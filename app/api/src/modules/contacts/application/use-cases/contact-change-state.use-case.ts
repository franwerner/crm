import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface ChangeContactStateInput {
  contactId: string
  newState: PipelineState
  userId: string
}

export class ContactChangeStateUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: ChangeContactStateInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const stateChangeId = newId()
    const now = new Date()

    const updated = contact.changeStateManually({
      stateChangeId,
      newState: input.newState,
      userId: input.userId,
      now,
    })

    await this.repo.save(updated)
    return updated
  }
}
