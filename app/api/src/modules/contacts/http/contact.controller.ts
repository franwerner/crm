import type { Context } from 'hono'
import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactCreateUseCase } from '@modules/contacts/application/use-cases/contact-create.use-case'
import type { ContactGetUseCase } from '@modules/contacts/application/use-cases/contact-get.use-case'
import type { ContactListUseCase } from '@modules/contacts/application/use-cases/contact-list.use-case'
import type { ContactListEventsUseCase } from '@modules/contacts/application/use-cases/contact-list-events.use-case'
import type { ContactListStateChangesUseCase } from '@modules/contacts/application/use-cases/contact-list-state-changes.use-case'
import type { ContactListAssignmentsUseCase } from '@modules/contacts/application/use-cases/contact-list-assignments.use-case'
import type { ContactRegisterEventUseCase } from '@modules/contacts/application/use-cases/contact-register-event.use-case'
import type { ContactDeleteUseCase } from '@modules/contacts/application/use-cases/contact-delete.use-case'
import type { ContactBulkDeleteUseCase } from '@modules/contacts/application/use-cases/contact-bulk-delete.use-case'
import type { ContactKpisUseCase } from '@modules/contacts/application/use-cases/contact-kpis.use-case'
import type { ContactUpdateUseCase } from '@modules/contacts/application/use-cases/contact-update.use-case'
import type { ContactAddChannelUseCase } from '@modules/contacts/application/use-cases/contact-add-channel.use-case'
import type { ContactUpdateChannelUseCase } from '@modules/contacts/application/use-cases/contact-update-channel.use-case'
import type { ContactRemoveChannelUseCase } from '@modules/contacts/application/use-cases/contact-remove-channel.use-case'
import type { ContactAddAssignmentUseCase } from '@modules/contacts/application/use-cases/contact-add-assignment.use-case'
import type { ContactUpdateAssignmentRoleUseCase } from '@modules/contacts/application/use-cases/contact-update-assignment-role.use-case'
import type { ContactRemoveAssignmentUseCase } from '@modules/contacts/application/use-cases/contact-remove-assignment.use-case'
import type { CreateContactRequest } from '@modules/contacts/http/dto/in/contact-create.in'
import type { UpdateContactRequest } from '@modules/contacts/http/dto/in/contact-update.in'
import type { AddChannelRequest, UpdateChannelRequest } from '@modules/contacts/http/dto/in/contact-channel.in'
import type { AddAssignmentRequest, UpdateAssignmentRoleRequest } from '@modules/contacts/http/dto/in/contact-assignment.in'
import type { BulkDeleteContactsRequest } from '@modules/contacts/http/dto/in/contact-bulk-delete.in'
import type { ContactAssignmentListItem, ContactCreatorRef, ContactListInput, ContactListItem } from '@modules/contacts/application/contact.query'
import type { PaginationOnlyQuery } from '@shared/http/list-query'
import type { RegisterEventRequest } from '@modules/contacts/http/dto/in/contact-register-event.in'

export interface ContactUseCases {
  create: ContactCreateUseCase
  get: ContactGetUseCase
  list: ContactListUseCase
  kpis: ContactKpisUseCase
  listEvents: ContactListEventsUseCase
  listStateChanges: ContactListStateChangesUseCase
  listAssignments: ContactListAssignmentsUseCase
  registerEvent: ContactRegisterEventUseCase
  delete: ContactDeleteUseCase
  bulkDelete: ContactBulkDeleteUseCase
  update: ContactUpdateUseCase
  addChannel: ContactAddChannelUseCase
  updateChannel: ContactUpdateChannelUseCase
  removeChannel: ContactRemoveChannelUseCase
  addAssignment: ContactAddAssignmentUseCase
  updateAssignmentRole: ContactUpdateAssignmentRoleUseCase
  removeAssignment: ContactRemoveAssignmentUseCase
}

function toContactView(contact: Contact, creator?: ContactCreatorRef | null) {
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

function toAssignmentListView(item: ContactAssignmentListItem) {
  return {
    userId: item.userId,
    userName: item.userName,
    role: item.role,
    assignedBy: item.assignedBy,
    assignedAt: item.assignedAt.toISOString(),
  }
}

function toEventView(event: ContactEvent) {
  return {
    id: event.id,
    contactId: event.contactId,
    authorId: event.authorId,
    eventType: event.eventType,
    detail: event.detail,
    occurredAt: event.occurredAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }
}

function toStateChangeView(sc: ContactStateChange) {
  return {
    id: sc.id,
    contactId: sc.contactId,
    previousState: sc.previousState,
    nextState: sc.nextState,
    changedAt: sc.changedAt.toISOString(),
    createdAt: sc.createdAt.toISOString(),
  }
}

export class ContactController {
  constructor(private readonly ucs: ContactUseCases) {}

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

  async registerEvent(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as RegisterEventRequest
    const authorId = c.get('userId') as string

    const contact = await this.ucs.registerEvent.execute({
      contactId,
      authorId,
      eventType: body.eventType,
      detail: body.detail,
      occurredAt: new Date(body.occurredAt),
    })

    return c.json(toContactView(contact), 200)
  }

  async listContactEvents(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as PaginationOnlyQuery

    const page = await this.ucs.listEvents.execute({
      contactId,
      limit: query.pagination.limit,
      offset: query.pagination.offset,
    })

    return c.json(
      {
        items: page.items.map(toEventView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async listContactStateChanges(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as PaginationOnlyQuery

    const page = await this.ucs.listStateChanges.execute({
      contactId,
      limit: query.pagination.limit,
      offset: query.pagination.offset,
    })

    return c.json(
      {
        items: page.items.map(toStateChangeView),
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

  async addChannel(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddChannelRequest

    const contact = await this.ucs.addChannel.execute({
      contactId,
      channelType: body.channelType,
      value: body.value,
      isPrimary: body.isPrimary,
    })

    return c.json(toContactView(contact), 200)
  }

  async updateChannel(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const channelId = c.req.param('channelId') as string
    const body = c.req.valid('json' as never) as UpdateChannelRequest

    const contact = await this.ucs.updateChannel.execute({
      contactId,
      channelId,
      channelType: body.channelType,
      value: body.value,
      isPrimary: body.isPrimary,
    })

    return c.json(toContactView(contact), 200)
  }

  async removeChannel(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const channelId = c.req.param('channelId') as string

    const contact = await this.ucs.removeChannel.execute({ contactId, channelId })

    return c.json(toContactView(contact), 200)
  }

  async listContactAssignments(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const query = c.req.valid('query' as never) as PaginationOnlyQuery

    const page = await this.ucs.listAssignments.execute({
      contactId,
      limit: query.pagination.limit,
      offset: query.pagination.offset,
    })

    return c.json(
      {
        items: page.items.map(toAssignmentListView),
        total: page.total,
        limit: page.limit,
        offset: page.offset,
      },
      200,
    )
  }

  async addAssignment(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddAssignmentRequest
    const assignedBy = c.get('userId') as string

    const contact = await this.ucs.addAssignment.execute({
      contactId,
      userId: body.userId,
      role: body.role,
      assignedBy,
    })

    return c.json(toContactView(contact), 200)
  }

  async updateAssignmentRole(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const userId = c.req.param('userId') as string
    const body = c.req.valid('json' as never) as UpdateAssignmentRoleRequest

    const contact = await this.ucs.updateAssignmentRole.execute({
      contactId,
      userId,
      role: body.role,
    })

    return c.json(toContactView(contact), 200)
  }

  async removeAssignment(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const userId = c.req.param('userId') as string

    const contact = await this.ucs.removeAssignment.execute({ contactId, userId })

    return c.json(toContactView(contact), 200)
  }
}
