import type { Context } from 'hono'
import type { ContactCreateUseCase } from '@modules/contacts/application/use-cases/contact/contact-create.use-case'
import type { ContactGetUseCase } from '@modules/contacts/application/use-cases/contact/contact-get.use-case'
import type { ContactListUseCase } from '@modules/contacts/application/use-cases/contact/contact-list.use-case'
import type { ContactDeleteUseCase } from '@modules/contacts/application/use-cases/contact/contact-delete.use-case'
import type { ContactBulkDeleteUseCase } from '@modules/contacts/application/use-cases/contact/contact-bulk-delete.use-case'
import type { ContactKpisUseCase } from '@modules/contacts/application/use-cases/contact/contact-kpis.use-case'
import type { ContactUpdateUseCase } from '@modules/contacts/application/use-cases/contact/contact-update.use-case'
import type { CreateContactRequest } from '@modules/contacts/http/dto/in/contact-create.in'
import type { UpdateContactRequest } from '@modules/contacts/http/dto/in/contact-update.in'
import type { BulkDeleteContactsRequest } from '@modules/contacts/http/dto/in/contact-bulk-delete.in'
import type { ContactListInput, ContactListItem } from '@modules/contacts/application/contact.query'
import { toContactView } from './view-mappers'

export interface ContactCoreUseCases {
  create: ContactCreateUseCase
  get: ContactGetUseCase
  list: ContactListUseCase
  kpis: ContactKpisUseCase
  delete: ContactDeleteUseCase
  bulkDelete: ContactBulkDeleteUseCase
  update: ContactUpdateUseCase
}

function toContactListView(item: ContactListItem) {
  return {
    id: item.id,
    name: item.name,
    contactType: item.contactType,
    sex: item.sex,
    notes: item.notes,
    pipelineState: item.pipelineState,
    sourceChannel: item.sourceChannel,
    interestLevel: item.interestLevel,
    createdBy: item.createdBy,
    creator: item.creator,
    primaryChannel: item.primaryChannel,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export class ContactCoreController {
  constructor(private readonly ucs: ContactCoreUseCases) {}

  async createContact(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as CreateContactRequest
    const userId = c.get('userId') as string

    const contact = await this.ucs.create.execute({
      name: body.name,
      contactType: body.contactType,
      sex: body.sex,
      address: {
        street: body.addressStreet ?? null,
        number: body.addressNumber ?? null,
        postalCode: body.addressPostalCode ?? null,
        city: body.addressCity ?? null,
        province: body.addressProvince ?? null,
        country: body.addressCountry ?? null,
      },
      notes: body.notes,
      sourceChannel: body.sourceChannel,
      interestLevel: body.interestLevel,
      channels: body.channels,
      createdBy: userId,
    })

    return c.json(toContactView(contact), 201)
  }

  async getContact(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    const { contact, creator } = await this.ucs.get.execute({ id })

    return c.json(toContactView(contact, creator), 200)
  }

  async listContacts(c: Context): Promise<Response> {
    const query = c.req.valid('query' as never) as ContactListInput

    const page = await this.ucs.list.execute(query)

    return c.json(
      {
        items: page.items.map(toContactListView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async deleteContact(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    await this.ucs.delete.execute({ id })

    return c.body(null, 204)
  }

  async bulkDeleteContacts(c: Context): Promise<Response> {
    const body = c.req.valid('json' as never) as BulkDeleteContactsRequest

    await this.ucs.bulkDelete.execute({ ids: body.ids })

    return c.body(null, 204)
  }

  async getContactKpis(c: Context): Promise<Response> {
    const result = await this.ucs.kpis.execute()
    return c.json(
      {
        total: {
          count: Number(result.total.count),
          current: Number(result.total.current),
          previous: Number(result.total.previous),
        },
        states: result.states.map((s) => ({
          state: s.state,
          current: Number(s.current),
          previous: Number(s.previous),
        })),
      },
      200,
    )
  }

  async updateContact(c: Context): Promise<Response> {
    const id = c.req.param('id') as string
    const body = c.req.valid('json' as never) as UpdateContactRequest

    const contact = await this.ucs.update.execute({
      id,
      name: body.name,
      contactType: body.contactType,
      sex: body.sex,
      address: {
        street: body.addressStreet,
        number: body.addressNumber,
        postalCode: body.addressPostalCode,
        city: body.addressCity,
        province: body.addressProvince,
        country: body.addressCountry,
      },
      notes: body.notes,
      sourceChannel: body.sourceChannel,
      interestLevel: body.interestLevel,
    })

    return c.json(toContactView(contact), 200)
  }
}
