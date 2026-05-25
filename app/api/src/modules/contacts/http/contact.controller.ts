import type { Context } from 'hono'
import type { Contact } from '@modules/contacts/domain/contact'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactCreateUseCase } from '@modules/contacts/application/use-cases/contact-create.use-case'
import type { ContactGetUseCase } from '@modules/contacts/application/use-cases/contact-get.use-case'
import type { ContactListUseCase } from '@modules/contacts/application/use-cases/contact-list.use-case'
import type { ContactListEventsUseCase } from '@modules/contacts/application/use-cases/contact-list-events.use-case'
import type { ContactListStateChangesUseCase } from '@modules/contacts/application/use-cases/contact-list-state-changes.use-case'
import type { ContactRegisterEventUseCase } from '@modules/contacts/application/use-cases/contact-register-event.use-case'
import type { ContactChangeStateUseCase } from '@modules/contacts/application/use-cases/contact-change-state.use-case'
import type { ContactDeleteUseCase } from '@modules/contacts/application/use-cases/contact-delete.use-case'
import type { CreateContactRequest } from '@modules/contacts/http/dto/in/contact-create.in'
import type { ContactListInput, ContactListItem } from '@modules/contacts/application/contact.query'
import type { PaginationOnlyQuery } from '@shared/http/list-query'
import type { RegisterEventRequest } from '@modules/contacts/http/dto/in/contact-register-event.in'
import type { ChangeStateRequest } from '@modules/contacts/http/dto/in/contact-change-state.in'

export interface ContactUseCases {
  create: ContactCreateUseCase
  get: ContactGetUseCase
  list: ContactListUseCase
  listEvents: ContactListEventsUseCase
  listStateChanges: ContactListStateChangesUseCase
  registerEvent: ContactRegisterEventUseCase
  changeState: ContactChangeStateUseCase
  delete: ContactDeleteUseCase
}

function toContactView(contact: Contact) {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    pipelineState: contact.pipelineState,
    stateLocked: contact.stateLocked,
    sourceChannel: contact.sourceChannel,
    interestLevel: contact.interestLevel,
    createdBy: contact.createdBy,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  }
}

function toContactListView(item: ContactListItem) {
  return {
    id: item.id,
    name: item.name,
    phone: item.phone,
    pipelineState: item.pipelineState,
    stateLocked: item.stateLocked,
    sourceChannel: item.sourceChannel,
    interestLevel: item.interestLevel,
    createdBy: item.createdBy,
    ...(item.creator !== null ? { creator: item.creator } : {}),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
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
      phone: body.phone,
      sourceChannel: body.sourceChannel,
      interestLevel: body.interestLevel,
      createdBy: userId,
    })

    return c.json(toContactView(contact), 201)
  }

  async getContact(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    const contact = await this.ucs.get.execute({ id })

    return c.json(toContactView(contact), 200)
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

  async changeContactState(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as ChangeStateRequest
    const userId = c.get('userId') as string

    const contact = await this.ucs.changeState.execute({
      contactId,
      newState: body.newState,
      userId,
    })

    return c.json(toContactView(contact), 200)
  }

  async deleteContact(c: Context): Promise<Response> {
    const id = c.req.param('id') as string

    await this.ucs.delete.execute({ id })

    return c.body(null, 204)
  }
}
