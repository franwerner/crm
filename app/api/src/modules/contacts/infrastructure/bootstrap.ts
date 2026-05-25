import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Db } from '@shared/db/client'
import { DrizzleContactsRepository } from '@modules/contacts/infrastructure/contact.repository.bun'
import { DrizzleContactQueries } from '@modules/contacts/infrastructure/contact.query.drizzle'
import { ContactCreateUseCase } from '@modules/contacts/application/use-cases/contact-create.use-case'
import { ContactGetUseCase } from '@modules/contacts/application/use-cases/contact-get.use-case'
import { ContactListUseCase } from '@modules/contacts/application/use-cases/contact-list.use-case'
import { ContactListEventsUseCase } from '@modules/contacts/application/use-cases/contact-list-events.use-case'
import { ContactListStateChangesUseCase } from '@modules/contacts/application/use-cases/contact-list-state-changes.use-case'
import { ContactRegisterEventUseCase } from '@modules/contacts/application/use-cases/contact-register-event.use-case'
import { ContactChangeStateUseCase } from '@modules/contacts/application/use-cases/contact-change-state.use-case'
import { ContactDeleteUseCase } from '@modules/contacts/application/use-cases/contact-delete.use-case'
import { ContactController } from '@modules/contacts/http/contact.controller'
import { createContactsRouter } from '@modules/contacts/http/contact.routes'

export interface ContactsModule {
  router: OpenAPIHono
}

export function bootstrapContacts(db: Db): ContactsModule {
  const repo = new DrizzleContactsRepository(db)
  const queries = new DrizzleContactQueries(db)

  const controller = new ContactController({
    create: new ContactCreateUseCase(repo),
    get: new ContactGetUseCase(repo),
    list: new ContactListUseCase(queries),
    listEvents: new ContactListEventsUseCase(repo),
    listStateChanges: new ContactListStateChangesUseCase(repo),
    registerEvent: new ContactRegisterEventUseCase(repo),
    changeState: new ContactChangeStateUseCase(repo),
    delete: new ContactDeleteUseCase(repo),
  })

  return {
    router: createContactsRouter(controller),
  }
}
