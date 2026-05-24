import { pgEnum, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'

export const pipelineStateEnum = pgEnum('pipeline_state', [
  'Contact',
  'Lead',
  'Customer',
  'Discarded',
])

export const eventTypeEnum = pgEnum('event_type', [
  'FirstContact',
  'MessageSent',
  'ResponseReceived',
  'MeetingCall',
  'ProposalSent',
  'ProposalWon',
  'ProposalRejected',
  'FollowUpPending',
  'Note',
])

export const sourceChannelEnum = pgEnum('source_channel', [
  'Instagram',
  'WhatsApp',
  'Referral',
  'Email',
  'Other',
])

export const interestLevelEnum = pgEnum('interest_level', [
  'Cold',
  'Warm',
  'Hot',
])

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  pipelineState: pipelineStateEnum('pipeline_state').notNull().default('Contact'),
  stateLocked: boolean('state_locked').notNull().default(false),
  sourceChannel: sourceChannelEnum('source_channel'),
  interestLevel: interestLevelEnum('interest_level'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey(),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id),
  eventType: eventTypeEnum('event_type').notNull(),
  detail: text('detail').notNull().default(''),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})

export const stateChanges = pgTable('state_changes', {
  id: uuid('id').primaryKey(),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id),
  previousState: pipelineStateEnum('previous_state').notNull(),
  nextState: pipelineStateEnum('next_state').notNull(),
  causedByEventId: uuid('caused_by_event_id').references(() => events.id),
  causedByUserId: uuid('caused_by_user_id').references(() => users.id),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})
