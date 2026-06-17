import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, boolean, varchar, date, check, bigint, integer, jsonb, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const pipelineStateEnum = pgEnum('pipeline_state', [
  'Contact',
  'Lead',
  'AtRisk',
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
  'Discarded',
  'Reopened',
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

export const contactTypeEnum = pgEnum('contact_type', [
  'Person',
  'Company',
])

export const sexEnum = pgEnum('sex', [
  'Male',
  'Female',
  'Other',
  'Unspecified',
])

export const channelTypeEnum = pgEnum('channel_type', [
  'Phone',
  'Email',
  'WhatsApp',
  'Instagram',
  'Website',
  'Other',
])

export const contactAssignmentRoleEnum = pgEnum('contact_assignment_role', [
  'Owner',
  'Collaborator',
])

// --- Enums added for Fase 1: Ingesta de Contactos por Excel ---

export const importStatusEnum = pgEnum('import_status', [
  'awaiting_mapping',
  'pending',
  'processing',
  'completed',
  'failed',
])

export const importStageEnum = pgEnum('import_stage', [
  'counting',
  'ingesting',
  'finalizing',
])

// Unverified = not yet attempted; invalid = conclusively bad; valid = passed all checks.
// A transient error (e.g. DNS timeout) yields unverified + reason in verificationDetail.
export const contactVerificationStatusEnum = pgEnum('contact_verification_status', [
  'unverified',
  'valid',
  'invalid',
])

// --- End Fase 1 enums ---

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
  contactType: contactTypeEnum('contact_type').notNull().default('Person'),
  sex: sexEnum('sex'),
  addressStreet: text('address_street'),
  addressNumber: text('address_number'),
  addressPostalCode: text('address_postal_code'),
  addressCity: text('address_city'),
  addressProvince: text('address_province'),
  addressCountry: text('address_country'),
  notes: text('notes'),
  pipelineState: pipelineStateEnum('pipeline_state').notNull().default('Contact'),
  sourceChannel: sourceChannelEnum('source_channel'),
  interestLevel: interestLevelEnum('interest_level'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const contactAssignments = pgTable(
  'contact_assignments',
  {
    id: uuid('id').primaryKey(),
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: contactAssignmentRoleEnum('role').notNull(),
    assignedBy: uuid('assigned_by')
      .notNull()
      .references(() => users.id),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (t) => ({
    contactUserUnique: uniqueIndex('contact_assignments_contact_user_uq').on(t.contactId, t.userId),
  }),
)

export const contactChannels = pgTable('contact_channels', {
  id: uuid('id').primaryKey(),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contacts.id),
  channelType: channelTypeEnum('channel_type').notNull(),
  value: text('value').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  // --- Verification fields added for Fase 1 (R8.1) ---
  verificationStatus: contactVerificationStatusEnum('verification_status').notNull().default('unverified'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verificationDetail: jsonb('verification_detail'),
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
  causedByEventId: uuid('caused_by_event_id').notNull().references(() => events.id),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})

export const projectStatusEnum = pgEnum('project_status', [
  'Draft',
  'Active',
  'Closed',
  'Cancelled',
])

export const projectResponsibleRoleEnum = pgEnum('project_responsible_role', [
  'Lead',
  'Member',
])

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    contactId: uuid('contact_id')
      .notNull()
      .references(() => contacts.id),
    currency: varchar('currency', { length: 3 }).notNull(),
    status: projectStatusEnum('status').notNull().default('Draft'),
    startDate: date('start_date', { mode: 'date' }).notNull(),
    plannedEndDate: date('planned_end_date', { mode: 'date' }).notNull(),
    originalPlannedEndDate: date('original_planned_end_date', { mode: 'date' }).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    currencyCheck: check('projects_currency_format', sql`${t.currency} ~ '^[A-Z]{3}$'`),
    dateOrderCheck: check('projects_date_order', sql`${t.plannedEndDate} >= ${t.startDate}`),
  }),
)

export const projectExtensions = pgTable(
  'project_extensions',
  {
    id: text('id').primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    additionalDays: integer('additional_days').notNull(),
    appliedEndDate: date('applied_end_date', { mode: 'date' }).notNull(),
    reason: text('reason').notNull(),
    costMinor: bigint('cost_minor', { mode: 'number' }),
    billedAmountMinor: bigint('billed_amount_minor', { mode: 'number' }),
    grantedAt: date('granted_at', { mode: 'date' }).notNull(),
    grantedBy: uuid('granted_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    additionalDaysCheck: check('project_extensions_additional_days_pos', sql`${t.additionalDays} > 0`),
    costCheck: check('project_extensions_cost_nonneg', sql`${t.costMinor} IS NULL OR ${t.costMinor} >= 0`),
    billedAmountCheck: check('project_extensions_billed_amount_nonneg', sql`${t.billedAmountMinor} IS NULL OR ${t.billedAmountMinor} >= 0`),
  }),
)

export const projectStateChanges = pgTable('project_state_changes', {
  id: uuid('id').primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  previousState: projectStatusEnum('previous_state').notNull(),
  nextState: projectStatusEnum('next_state').notNull(),
  causeKind: text('cause_kind').notNull(),
  causedByUserId: uuid('caused_by_user_id').references(() => users.id),
  causeReason: text('cause_reason'),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
})

export const projectResponsibles = pgTable(
  'project_responsibles',
  {
    id: uuid('id').primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: projectResponsibleRoleEnum('role').notNull(),
    assignedBy: uuid('assigned_by')
      .notNull()
      .references(() => users.id),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (t) => ({
    projectUserUnique: uniqueIndex('project_responsibles_project_user_uq').on(t.projectId, t.userId),
  }),
)

export const projectBudgetItems = pgTable(
  'project_budget_items',
  {
    id: uuid('id').primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    concept: text('concept').notNull(),
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (t) => ({
    amountCheck: check('project_budget_items_amount_nonneg', sql`${t.amountMinor} >= 0`),
  }),
)

export const projectExpenses = pgTable(
  'project_expenses',
  {
    id: uuid('id').primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    concept: text('concept').notNull(),
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    incurredAt: date('incurred_at', { mode: 'date' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (t) => ({
    amountCheck: check('project_expenses_amount_nonneg', sql`${t.amountMinor} >= 0`),
  }),
)

export const projectDocuments = pgTable(
  'project_documents',
  {
    id: text('id').primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    contentType: text('content_type').notNull(),
    sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
    storageKey: text('storage_key').notNull().unique(),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sizeCheck: check(
      'project_documents_size_range',
      sql`${t.sizeBytes} > 0 AND ${t.sizeBytes} <= 26214400`,
    ),
  }),
)

// --- imports table (Fase 1: Ingesta de Contactos por Excel, D6) ---

export const imports = pgTable(
  'imports',
  {
    id: uuid('id').primaryKey(),
    filename: text('filename').notNull(),
    fileKey: text('file_key').notNull(),
    status: importStatusEnum('status').notNull(),
    // NULL until the worker begins processing
    stage: importStageEnum('stage'),
    columnHeaders: jsonb('column_headers').notNull(),
    // NULL until the user submits a mapping
    mapping: jsonb('mapping'),
    // nullable, no FK — templates are out of scope in Fase 1
    templateId: uuid('template_id'),
    totalRows: integer('total_rows'),
    processedRows: integer('processed_rows').notNull().default(0),
    okCount: integer('ok_count').notNull().default(0),
    failedCount: integer('failed_count').notNull().default(0),
    duplicatedCount: integer('duplicated_count').notNull().default(0),
    // NULL when zero rejects (R5.3)
    rejectedCsvKey: text('rejected_csv_key'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    // Set when processing begins; used by the reconciliation stale-threshold heuristic (D9)
    startedAt: timestamp('started_at', { withTimezone: true }),
    // Blank-safe resume anchor: the actual Excel row.number of the last committed batch (D7)
    lastRowNumber: integer('last_row_number').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // Used by the reconciliation scan (D9)
    statusIdx: index('idx_imports_status').on(t.status),
    createdByIdx: index('idx_imports_created_by').on(t.createdBy),
  }),
)
