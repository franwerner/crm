import type { Context } from 'hono'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactListStateChangesUseCase } from '@modules/contacts/application/use-cases/state-change/contact-list-state-changes.use-case'
import type { PaginationOnlyQuery } from '@shared/http/list-query'

export interface ContactStateChangeUseCases {
  listStateChanges: ContactListStateChangesUseCase
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

export class ContactStateChangeController {
  constructor(private readonly ucs: ContactStateChangeUseCases) {}

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
}
