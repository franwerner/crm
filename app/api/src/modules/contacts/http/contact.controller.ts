import type { Context } from 'hono'
import type { ContactCreateUseCase } from '@modules/contacts/application/use-cases/contact/contact-create.use-case'
import type { ContactGetUseCase } from '@modules/contacts/application/use-cases/contact/contact-get.use-case'
import type { ContactListUseCase } from '@modules/contacts/application/use-cases/contact/contact-list.use-case'
import type { ContactDeleteUseCase } from '@modules/contacts/application/use-cases/contact/contact-delete.use-case'
import type { ContactBulkDeleteUseCase } from '@modules/contacts/application/use-cases/contact/contact-bulk-delete.use-case'
import type { ContactKpisUseCase } from '@modules/contacts/application/use-cases/contact/contact-kpis.use-case'
import type { ContactUpdateUseCase } from '@modules/contacts/application/use-cases/contact/contact-update.use-case'
import type { ContactAddChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-add-channel.use-case'
import type { ContactUpdateChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-update-channel.use-case'
import type { ContactRemoveChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-remove-channel.use-case'
import type { ContactListEventsUseCase } from '@modules/contacts/application/use-cases/event/contact-list-events.use-case'
import type { ContactListStateChangesUseCase } from '@modules/contacts/application/use-cases/state-change/contact-list-state-changes.use-case'
import type { ContactListAssignmentsUseCase } from '@modules/contacts/application/use-cases/assignment/contact-list-assignments.use-case'
import type { ContactRegisterEventUseCase } from '@modules/contacts/application/use-cases/event/contact-register-event.use-case'
import type { ContactAddAssignmentUseCase } from '@modules/contacts/application/use-cases/assignment/contact-add-assignment.use-case'
import type { ContactUpdateAssignmentRoleUseCase } from '@modules/contacts/application/use-cases/assignment/contact-update-assignment-role.use-case'
import type { ContactRemoveAssignmentUseCase } from '@modules/contacts/application/use-cases/assignment/contact-remove-assignment.use-case'
import { ContactCoreController } from './controllers/contact-core.controller'
import { ContactChannelController } from './controllers/contact-channel.controller'
import { ContactEventController } from './controllers/contact-event.controller'
import { ContactStateChangeController } from './controllers/contact-state-change.controller'
import { ContactAssignmentController } from './controllers/contact-assignment.controller'

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

export class ContactController {
  private readonly core: ContactCoreController
  private readonly channel: ContactChannelController
  private readonly event: ContactEventController
  private readonly stateChange: ContactStateChangeController
  private readonly assignment: ContactAssignmentController

  constructor(ucs: ContactUseCases) {
    this.core = new ContactCoreController(ucs)
    this.channel = new ContactChannelController(ucs)
    this.event = new ContactEventController(ucs)
    this.stateChange = new ContactStateChangeController(ucs)
    this.assignment = new ContactAssignmentController(ucs)
  }

  async createContact(c: Context): Promise<Response> {
    return this.core.createContact(c)
  }

  async getContact(c: Context): Promise<Response> {
    return this.core.getContact(c)
  }

  async listContacts(c: Context): Promise<Response> {
    return this.core.listContacts(c)
  }

  async deleteContact(c: Context): Promise<Response> {
    return this.core.deleteContact(c)
  }

  async bulkDeleteContacts(c: Context): Promise<Response> {
    return this.core.bulkDeleteContacts(c)
  }

  async getContactKpis(c: Context): Promise<Response> {
    return this.core.getContactKpis(c)
  }

  async updateContact(c: Context): Promise<Response> {
    return this.core.updateContact(c)
  }

  async addChannel(c: Context): Promise<Response> {
    return this.channel.addChannel(c)
  }

  async updateChannel(c: Context): Promise<Response> {
    return this.channel.updateChannel(c)
  }

  async removeChannel(c: Context): Promise<Response> {
    return this.channel.removeChannel(c)
  }

  async registerEvent(c: Context): Promise<Response> {
    return this.event.registerEvent(c)
  }

  async listContactEvents(c: Context): Promise<Response> {
    return this.event.listContactEvents(c)
  }

  async listContactStateChanges(c: Context): Promise<Response> {
    return this.stateChange.listContactStateChanges(c)
  }

  async listContactAssignments(c: Context): Promise<Response> {
    return this.assignment.listContactAssignments(c)
  }

  async addAssignment(c: Context): Promise<Response> {
    return this.assignment.addAssignment(c)
  }

  async updateAssignmentRole(c: Context): Promise<Response> {
    return this.assignment.updateAssignmentRole(c)
  }

  async removeAssignment(c: Context): Promise<Response> {
    return this.assignment.removeAssignment(c)
  }
}
