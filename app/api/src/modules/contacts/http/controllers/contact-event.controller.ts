import type { Context } from 'hono'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactListEventsUseCase } from '@modules/contacts/application/use-cases/event/contact-list-events.use-case'
import type { ContactRegisterEventUseCase } from '@modules/contacts/application/use-cases/event/contact-register-event.use-case'
import type { RegisterEventRequest } from '@modules/contacts/http/dto/in/contact-register-event.in'
import type { PaginationOnlyQuery } from '@shared/http/list-query'
import { toContactView } from './view-mappers'

export interface ContactEventUseCases {
  listEvents: ContactListEventsUseCase
  registerEvent: ContactRegisterEventUseCase
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

export class ContactEventController {
  constructor(private readonly ucs: ContactEventUseCases) {}

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
}
