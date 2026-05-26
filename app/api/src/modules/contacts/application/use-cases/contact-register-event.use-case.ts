import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { EventType } from '@modules/contacts/domain/types/event-type'
import { NotFoundError } from '@shared/errors'
import { newId } from '@shared/utils/id'

export interface RegisterEventInput {
  contactId: string
  authorId: string
  eventType: EventType
  detail: string
  occurredAt: Date
}

export class ContactRegisterEventUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: RegisterEventInput): Promise<Contact> {
    const contact = await this.repo.findById(input.contactId)
    if (!contact) {
      throw new NotFoundError(`Contact ${input.contactId} not found`)
    }

    const eventId = newId()
    const stateChangeId = newId()
    const now = new Date()

    const updated = contact.registerEvent({
      eventId,
      stateChangeId,
      authorId: input.authorId,
      eventType: input.eventType,
      detail: input.detail,
      occurredAt: input.occurredAt,
      now,
    })

    await this.repo.appendEvent(updated)
    return updated
  }
}
