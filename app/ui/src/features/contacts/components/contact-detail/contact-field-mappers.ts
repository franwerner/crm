import type { UpdateContactBody } from '@shared/api/types/UpdateContactBody'
import type { ContactView } from '@shared/api/types/ContactView'

export function makeValues(contact: ContactView): Partial<UpdateContactBody> {
  return {
    name: contact.name,
    contactType: contact.contactType,
    sex: contact.sex ?? undefined,
    sourceChannel: contact.sourceChannel ?? undefined,
    interestLevel: contact.interestLevel ?? undefined,
    notes: contact.notes ?? undefined,
    addressStreet: contact.addressStreet ?? undefined,
    addressNumber: contact.addressNumber ?? undefined,
    addressPostalCode: contact.addressPostalCode ?? undefined,
    addressCity: contact.addressCity ?? undefined,
    addressProvince: contact.addressProvince ?? undefined,
    addressCountry: contact.addressCountry ?? undefined,
  }
}
