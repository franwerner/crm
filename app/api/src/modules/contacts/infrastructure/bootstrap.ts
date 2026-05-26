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
import { ContactDeleteUseCase } from '@modules/contacts/application/use-cases/contact-delete.use-case'
import { ContactBulkDeleteUseCase } from '@modules/contacts/application/use-cases/contact-bulk-delete.use-case'
import { ContactKpisUseCase } from '@modules/contacts/application/use-cases/contact-kpis.use-case'
import { ContactUpdateUseCase } from '@modules/contacts/application/use-cases/contact-update.use-case'
import { ContactAddChannelUseCase } from '@modules/contacts/application/use-cases/contact-add-channel.use-case'
import { ContactUpdateChannelUseCase } from '@modules/contacts/application/use-cases/contact-update-channel.use-case'
import { ContactRemoveChannelUseCase } from '@modules/contacts/application/use-cases/contact-remove-channel.use-case'
import { ContactAddAssignmentUseCase } from '@modules/contacts/application/use-cases/contact-add-assignment.use-case'
import { ContactUpdateAssignmentRoleUseCase } from '@modules/contacts/application/use-cases/contact-update-assignment-role.use-case'
import { ContactRemoveAssignmentUseCase } from '@modules/contacts/application/use-cases/contact-remove-assignment.use-case'
import { ContactListAssignmentsUseCase } from '@modules/contacts/application/use-cases/contact-list-assignments.use-case'
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
    get: new ContactGetUseCase(repo, queries),
    list: new ContactListUseCase(queries),
    kpis: new ContactKpisUseCase(queries),
    listEvents: new ContactListEventsUseCase(repo),
    listStateChanges: new ContactListStateChangesUseCase(repo),
    listAssignments: new ContactListAssignmentsUseCase(queries),
    registerEvent: new ContactRegisterEventUseCase(repo),
    delete: new ContactDeleteUseCase(repo),
    bulkDelete: new ContactBulkDeleteUseCase(repo),
    update: new ContactUpdateUseCase(repo),
    addChannel: new ContactAddChannelUseCase(repo),
    updateChannel: new ContactUpdateChannelUseCase(repo),
    removeChannel: new ContactRemoveChannelUseCase(repo),
    addAssignment: new ContactAddAssignmentUseCase(repo),
    updateAssignmentRole: new ContactUpdateAssignmentRoleUseCase(repo),
    removeAssignment: new ContactRemoveAssignmentUseCase(repo),
  })

  return {
    router: createContactsRouter(controller),
  }
}
