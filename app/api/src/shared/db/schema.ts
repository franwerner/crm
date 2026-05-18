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
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  handle: text('handle'),
  phone: text('phone'),
  pipeline_state: pipelineStateEnum('pipeline_state').notNull().default('Contact'),
  state_locked: boolean('state_locked').notNull().default(false),
  source_channel: sourceChannelEnum('source_channel'),
  interest_level: interestLevelEnum('interest_level'),
  created_by: uuid('created_by')
    .notNull()
    .references(() => users.id),
  created_at: timestamp('created_at', { withTimezone: true }).notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey(),
  contact_id: uuid('contact_id')
    .notNull()
    .references(() => contacts.id),
  author_id: uuid('author_id')
    .notNull()
    .references(() => users.id),
  event_type: eventTypeEnum('event_type').notNull(),
  detail: text('detail').notNull().default(''),
  occurred_at: timestamp('occurred_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull(),
})

export const stateChanges = pgTable('state_changes', {
  id: uuid('id').primaryKey(),
  contact_id: uuid('contact_id')
    .notNull()
    .references(() => contacts.id),
  previous_state: pipelineStateEnum('previous_state').notNull(),
  next_state: pipelineStateEnum('next_state').notNull(),
  caused_by_event_id: uuid('caused_by_event_id').references(() => events.id),
  caused_by_user_id: uuid('caused_by_user_id').references(() => users.id),
  changed_at: timestamp('changed_at', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull(),
})
