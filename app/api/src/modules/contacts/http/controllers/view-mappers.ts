import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactCreatorRef } from '@modules/contacts/application/contact.query'

export function toContactView(contact: Contact, creator?: ContactCreatorRef | null) {
  return {
    id: contact.id,
    name: contact.name,
    contactType: contact.contactType,
    sex: contact.sex,
    addressStreet: contact.address.street,
    addressNumber: contact.address.number,
    addressPostalCode: contact.address.postalCode,
    addressCity: contact.address.city,
    addressProvince: contact.address.province,
    addressCountry: contact.address.country,
    notes: contact.notes,
    pipelineState: contact.pipelineState,
    sourceChannel: contact.sourceChannel,
    interestLevel: contact.interestLevel,
    createdBy: contact.createdBy,
    ...(creator != null ? { creator } : {}),
    channels: contact.channels.map((ch) => ({
      id: ch.id,
      channelType: ch.channelType,
      value: ch.value,
      isPrimary: ch.isPrimary,
    })),
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  }
}
