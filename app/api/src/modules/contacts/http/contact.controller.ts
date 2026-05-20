import type { Context } from 'hono'
import type { ContactsRepository } from '../domain/contact.repository'
import type { Contact } from '../domain/contact'
import type { ContactEvent } from '../domain/entities/contact-event'
import type { ContactStateChange } from '../domain/entities/contact-state-change'
import { createContact } from '../application/use-cases/contact-create.use-case'
import { getContact } from '../application/use-cases/contact-get.use-case'
import { listContacts } from '../application/use-cases/contact-list.use-case'
import { listContactEvents } from '../application/use-cases/contact-list-events.use-case'
import { listContactStateChanges } from '../application/use-cases/contact-list-state-changes.use-case'
import { registerEvent } from '../application/use-cases/contact-register-event.use-case'
import { changeContactState } from '../application/use-cases/contact-change-state.use-case'
import { deleteContact } from '../application/use-cases/contact-delete.use-case'
import type { CreateContactRequest } from './dto/in/contact-create.in'
import type { RegisterEventRequest } from './dto/in/contact-register-event.in'
import type { ChangeStateRequest } from './dto/in/contact-change-state.in'

function toContactView(contact: Contact) {
  return {
    id: contact.id,
    name: contact.name,
    handle: contact.handle,
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

export async function createContactHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const body = c.req.valid('json' as never) as CreateContactRequest
  const userId = c.get('userId') as string

  const contact = await createContact(
    {
      name: body.name,
      handle: body.handle,
      phone: body.phone,
      sourceChannel: body.sourceChannel,
      interestLevel: body.interestLevel,
      createdBy: userId,
    },
    { repo },
  )

  return c.json(toContactView(contact), 201)
}

export async function getContactHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const id = c.req.param('id') as string

  const contact = await getContact({ id }, { repo })

  return c.json(toContactView(contact), 200)
}

export async function listContactsHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const query = c.req.valid('query' as never) as { limit: number; offset: number }

  const page = await listContacts({ limit: query.limit, offset: query.offset }, { repo })

  return c.json(
    {
      items: page.items.map(toContactView),
      total: page.total,
      limit: page.limit,
      offset: page.offset,
    },
    200,
  )
}

export async function registerEventHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const contactId = c.req.param('id') as string
  const body = c.req.valid('json' as never) as RegisterEventRequest
  const authorId = c.get('userId') as string

  const contact = await registerEvent(
    {
      contactId,
      authorId,
      eventType: body.eventType,
      detail: body.detail,
      occurredAt: new Date(body.occurredAt),
    },
    { repo },
  )

  return c.json(toContactView(contact), 200)
}

export async function listContactEventsHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const contactId = c.req.param('id') as string
  const query = c.req.valid('query' as never) as { limit: number; offset: number }

  const page = await listContactEvents(
    { contactId, limit: query.limit, offset: query.offset },
    { repo },
  )

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

export async function listContactStateChangesHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const contactId = c.req.param('id') as string
  const query = c.req.valid('query' as never) as { limit: number; offset: number }

  const page = await listContactStateChanges(
    { contactId, limit: query.limit, offset: query.offset },
    { repo },
  )

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

export async function changeContactStateHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const contactId = c.req.param('id') as string
  const body = c.req.valid('json' as never) as ChangeStateRequest
  const userId = c.get('userId') as string

  const contact = await changeContactState(
    {
      contactId,
      newState: body.newState,
      userId,
    },
    { repo },
  )

  return c.json(toContactView(contact), 200)
}

export async function deleteContactHandler(c: Context, repo: ContactsRepository): Promise<Response> {
  const id = c.req.param('id') as string

  await deleteContact({ id }, { repo })

  return c.body(null, 204)
}
