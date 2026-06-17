import { Contact } from '@modules/contacts/domain/contact'
import type { ContactsRepository } from '@modules/contacts/domain/contact.repository'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ContactType } from '@modules/contacts/domain/types/contact-type'
import type { Sex } from '@modules/contacts/domain/types/sex'
import type { ChannelType } from '@modules/contacts/domain/types/channel-type'
import type { Address } from '@modules/contacts/domain/value-objects/address'
import type { ContactChannel } from '@modules/contacts/domain/entities/contact-channel'
import { newId } from '@shared/utils/id'

export interface CreateChannelInput {
  channelType: ChannelType
  value: string
  isPrimary: boolean
}

export interface CreateContactInput {
  name: string
  contactType?: ContactType
  sex?: Sex | null
  address?: Partial<Address>
  notes?: string | null
  sourceChannel?: SourceChannel | null
  interestLevel?: InterestLevel | null
  createdBy: string
  channels?: CreateChannelInput[]
}

export class ContactCreateUseCase {
  constructor(private readonly repo: ContactsRepository) {}

  async execute(input: CreateContactInput): Promise<Contact> {
    const now = new Date()

    const channels: ContactChannel[] = (input.channels ?? []).map((ch) => ({
      id: newId(),
      contactId: '',
      channelType: ch.channelType,
      value: ch.value,
      isPrimary: ch.isPrimary,
      createdAt: now,
      updatedAt: now,
      // Channels created directly start unverified; the checker runs separately via addChannel use-case.
      verificationStatus: 'unverified' as const,
      verifiedAt: null,
      verificationDetail: null,
    }))

    const contactId = newId()

    const channelsWithContactId: ContactChannel[] = channels.map((ch) => ({
      ...ch,
      contactId,
    }))

    const contact = Contact.create({
      id: contactId,
      name: input.name,
      contactType: input.contactType,
      sex: input.sex,
      address: input.address,
      notes: input.notes,
      sourceChannel: input.sourceChannel,
      interestLevel: input.interestLevel,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      channels: channelsWithContactId,
    })
    await this.repo.create(contact)
    return contact
  }
}
