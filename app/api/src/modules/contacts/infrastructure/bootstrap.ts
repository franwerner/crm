import type { OpenAPIHono } from '@hono/zod-openapi'
import type { Db } from '@shared/db/client'
import type { ChannelChecker } from '@shared/verification/channel-checker'
import type { ContactBulkRepository } from '@modules/contacts/domain/contact-bulk.repository'
import { DrizzleContactsRepository } from '@modules/contacts/infrastructure/contact.repository.bun'
import { DrizzleContactQueries } from '@modules/contacts/infrastructure/contact.query.drizzle'
import { DrizzleContactBulkRepository } from '@modules/contacts/infrastructure/repositories/contact-bulk.repo-part'
import { ContactCreateUseCase } from '@modules/contacts/application/use-cases/contact/contact-create.use-case'
import { ContactGetUseCase } from '@modules/contacts/application/use-cases/contact/contact-get.use-case'
import { ContactListUseCase } from '@modules/contacts/application/use-cases/contact/contact-list.use-case'
import { ContactDeleteUseCase } from '@modules/contacts/application/use-cases/contact/contact-delete.use-case'
import { ContactBulkDeleteUseCase } from '@modules/contacts/application/use-cases/contact/contact-bulk-delete.use-case'
import { ContactKpisUseCase } from '@modules/contacts/application/use-cases/contact/contact-kpis.use-case'
import { ContactUpdateUseCase } from '@modules/contacts/application/use-cases/contact/contact-update.use-case'
import { ContactAddChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-add-channel.use-case'
import { ContactUpdateChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-update-channel.use-case'
import { ContactRemoveChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-remove-channel.use-case'
import { ContactRegisterEventUseCase } from '@modules/contacts/application/use-cases/event/contact-register-event.use-case'
import { ContactListEventsUseCase } from '@modules/contacts/application/use-cases/event/contact-list-events.use-case'
import { ContactListStateChangesUseCase } from '@modules/contacts/application/use-cases/state-change/contact-list-state-changes.use-case'
import { ContactAddAssignmentUseCase } from '@modules/contacts/application/use-cases/assignment/contact-add-assignment.use-case'
import { ContactUpdateAssignmentRoleUseCase } from '@modules/contacts/application/use-cases/assignment/contact-update-assignment-role.use-case'
import { ContactRemoveAssignmentUseCase } from '@modules/contacts/application/use-cases/assignment/contact-remove-assignment.use-case'
import { ContactListAssignmentsUseCase } from '@modules/contacts/application/use-cases/assignment/contact-list-assignments.use-case'
import { ContactController } from '@modules/contacts/http/contact.controller'
import { createContactsRouter } from '@modules/contacts/http/contact.routes'

export interface ContactsModule {
  router: OpenAPIHono
  // Exposed so app.ts can pass this instance to the imports bootstrap (shared bulk-insert contract).
  bulkRepo: ContactBulkRepository
}

/**
 * Bootstrap the contacts module.
 *
 * @param db      Drizzle database instance (shared across modules).
 * @param checker Channel verification service built once in app.ts and shared with imports (D8).
 */
export function bootstrapContacts(db: Db, checker: ChannelChecker): ContactsModule {
  const repo = new DrizzleContactsRepository(db)
  const queries = new DrizzleContactQueries(db)
  const bulkRepo = new DrizzleContactBulkRepository(db)

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
    addChannel: new ContactAddChannelUseCase(repo, checker),
    updateChannel: new ContactUpdateChannelUseCase(repo, checker),
    removeChannel: new ContactRemoveChannelUseCase(repo),
    addAssignment: new ContactAddAssignmentUseCase(repo),
    updateAssignmentRole: new ContactUpdateAssignmentRoleUseCase(repo),
    removeAssignment: new ContactRemoveAssignmentUseCase(repo),
  })

  return {
    router: createContactsRouter(controller),
    bulkRepo,
  }
}
