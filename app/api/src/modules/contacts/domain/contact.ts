import { ValidationError, BusinessRuleError, NotFoundError } from '@shared/errors'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { EventType } from '@modules/contacts/domain/types/event-type'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ContactType } from '@modules/contacts/domain/types/contact-type'
import type { Sex } from '@modules/contacts/domain/types/sex'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import type { ContactChannel } from '@modules/contacts/domain/entities/contact-channel'
import type { ContactAssignment } from '@modules/contacts/domain/entities/contact-assignment'
import type { ContactAssignmentRole } from '@modules/contacts/domain/types/contact-assignment-role'
import type { Address } from '@modules/contacts/domain/value-objects/address'
import { applyTransition, isEventAllowed } from '@modules/contacts/domain/policies'

export interface ContactProps {
  readonly id: string
  readonly name: string
  readonly contactType: ContactType
  readonly sex: Sex | null
  readonly address: Address
  readonly notes: string | null
  readonly pipelineState: PipelineState
  readonly sourceChannel: SourceChannel | null
  readonly interestLevel: InterestLevel | null
  readonly createdBy: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
  readonly events: readonly ContactEvent[]
  readonly stateChanges: readonly ContactStateChange[]
  readonly channels: readonly ContactChannel[]
  readonly assignments: readonly ContactAssignment[]
}

export class Contact {
  private readonly props: ContactProps
  private readonly pendingEvents: ContactEvent[]
  private readonly pendingStateChanges: ContactStateChange[]

  private constructor(
    props: ContactProps,
    pendingEvents: ContactEvent[],
    pendingStateChanges: ContactStateChange[],
  ) {
    this.props = props
    this.pendingEvents = pendingEvents
    this.pendingStateChanges = pendingStateChanges
  }

  static create(params: {
    id: string
    name: string
    contactType?: ContactType
    sex?: Sex | null
    address?: Partial<Address>
    notes?: string | null
    sourceChannel?: SourceChannel | null
    interestLevel?: InterestLevel | null
    createdBy: string
    createdAt: Date
    updatedAt: Date
    channels?: readonly ContactChannel[]
  }): Contact {
    if (!params.name.trim()) {
      throw new ValidationError('Contact name cannot be empty', [
        { field: 'name', message: 'Name is required' },
      ])
    }
    if (!params.id.trim()) {
      throw new ValidationError('Contact id cannot be empty', [
        { field: 'id', message: 'Id is required' },
      ])
    }
    if (!params.createdBy.trim()) {
      throw new ValidationError('createdBy cannot be empty', [
        { field: 'createdBy', message: 'createdBy is required' },
      ])
    }

    const contactType: ContactType = params.contactType ?? 'Person'

    if (contactType === 'Company' && params.sex != null) {
      throw new ValidationError('Company contacts cannot have a sex value', [
        { field: 'sex', message: 'sex must be null for Company contacts' },
      ])
    }

    const channels = params.channels ?? []
    const primaryCount = channels.filter((c) => c.isPrimary).length
    if (primaryCount > 1) {
      throw new ValidationError('At most one channel can be primary', [
        { field: 'channels', message: 'Multiple primary channels are not allowed' },
      ])
    }

    const address: Address = {
      street: params.address?.street ?? null,
      number: params.address?.number ?? null,
      postalCode: params.address?.postalCode ?? null,
      city: params.address?.city ?? null,
      province: params.address?.province ?? null,
      country: params.address?.country ?? null,
    }

    const props: ContactProps = {
      id: params.id,
      name: params.name.trim(),
      contactType,
      sex: params.sex ?? null,
      address,
      notes: params.notes ?? null,
      pipelineState: 'Contact',
      sourceChannel: params.sourceChannel ?? null,
      interestLevel: params.interestLevel ?? null,
      createdBy: params.createdBy,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      deletedAt: null,
      events: [],
      stateChanges: [],
      channels,
      assignments: [],
    }

    return new Contact(props, [], [])
  }

  static reconstitute(props: ContactProps): Contact {
    return new Contact(props, [], [])
  }

  private withProps(patch: Partial<ContactProps>): Contact {
    return new Contact({ ...this.props, ...patch }, [...this.pendingEvents], [...this.pendingStateChanges])
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get contactType(): ContactType { return this.props.contactType }
  get sex(): Sex | null { return this.props.sex }
  get address(): Address { return this.props.address }
  get notes(): string | null { return this.props.notes }
  get pipelineState(): PipelineState { return this.props.pipelineState }
  get sourceChannel(): SourceChannel | null { return this.props.sourceChannel }
  get interestLevel(): InterestLevel | null { return this.props.interestLevel }
  get createdBy(): string { return this.props.createdBy }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Date | null { return this.props.deletedAt }
  get events(): readonly ContactEvent[] { return this.props.events }
  get stateChanges(): readonly ContactStateChange[] { return this.props.stateChanges }
  get channels(): readonly ContactChannel[] { return this.props.channels }
  get assignments(): readonly ContactAssignment[] { return this.props.assignments }
  get newEvents(): readonly ContactEvent[] { return this.pendingEvents }
  get newStateChanges(): readonly ContactStateChange[] { return this.pendingStateChanges }

  registerEvent(params: {
    eventId: string
    stateChangeId: string
    authorId: string
    eventType: EventType
    detail: string
    occurredAt: Date
    now: Date
  }): Contact {
    if (!isEventAllowed(this.props.pipelineState, params.eventType)) {
      throw new BusinessRuleError(
        `Event '${params.eventType}' is not allowed on a contact in state '${this.props.pipelineState}'`,
      )
    }

    const event: ContactEvent = {
      id: params.eventId,
      contactId: this.props.id,
      authorId: params.authorId,
      eventType: params.eventType,
      detail: params.detail,
      occurredAt: params.occurredAt,
      createdAt: params.now,
    }

    const currentState = this.props.pipelineState
    const targetState = applyTransition(currentState, params.eventType)
    const now = params.now

    let nextProps = {
      ...this.props,
      events: [...this.props.events, event],
      updatedAt: now,
    }

    const newPendingEvents = [...this.pendingEvents, event]
    const newPendingStateChanges = [...this.pendingStateChanges]

    if (targetState !== null) {
      const stateChange: ContactStateChange = {
        id: params.stateChangeId,
        contactId: this.props.id,
        previousState: currentState,
        nextState: targetState,
        cause: { kind: 'event', eventId: params.eventId },
        changedAt: now,
        createdAt: now,
      }

      nextProps = {
        ...nextProps,
        pipelineState: targetState,
        stateChanges: [...this.props.stateChanges, stateChange],
      }

      newPendingStateChanges.push(stateChange)
    }

    return new Contact(nextProps, newPendingEvents, newPendingStateChanges)
  }

  softDelete(now: Date): Contact {
    if (this.props.deletedAt !== null) {
      return this
    }

    return this.withProps({ deletedAt: now, updatedAt: now })
  }

  update(
    params: {
      name?: string
      contactType?: ContactType
      sex?: Sex | null
      address?: Partial<Address>
      notes?: string | null
      sourceChannel?: SourceChannel | null
      interestLevel?: InterestLevel | null
    },
    now: Date,
  ): Contact {
    if (params.name !== undefined && !params.name.trim()) {
      throw new ValidationError('Contact name cannot be empty', [
        { field: 'name', message: 'Name is required' },
      ])
    }

    const effectiveContactType = params.contactType ?? this.props.contactType
    const effectiveSex = effectiveContactType === 'Company' ? null : (params.sex !== undefined ? params.sex : this.props.sex)

    const nextAddress: Address = {
      street: params.address?.street !== undefined ? params.address.street : this.props.address.street,
      number: params.address?.number !== undefined ? params.address.number : this.props.address.number,
      postalCode: params.address?.postalCode !== undefined ? params.address.postalCode : this.props.address.postalCode,
      city: params.address?.city !== undefined ? params.address.city : this.props.address.city,
      province: params.address?.province !== undefined ? params.address.province : this.props.address.province,
      country: params.address?.country !== undefined ? params.address.country : this.props.address.country,
    }

    return this.withProps({
      name: params.name !== undefined ? params.name.trim() : this.props.name,
      contactType: effectiveContactType,
      sex: effectiveSex,
      address: nextAddress,
      notes: params.notes !== undefined ? params.notes : this.props.notes,
      sourceChannel: params.sourceChannel !== undefined ? params.sourceChannel : this.props.sourceChannel,
      interestLevel: params.interestLevel !== undefined ? params.interestLevel : this.props.interestLevel,
      updatedAt: now,
    })
  }

  addChannel(channel: ContactChannel): Contact {
    const demoted = this.props.channels.map((ch) =>
      channel.isPrimary && ch.isPrimary ? { ...ch, isPrimary: false } : ch,
    )

    return this.withProps({ channels: [...demoted, channel], updatedAt: channel.createdAt })
  }

  updateChannel(
    channelId: string,
    changes: {
      channelType?: ContactChannel['channelType']
      value?: string
      isPrimary?: boolean
      // Verification fields updated when the checker runs after a value change (R8.4).
      verificationStatus?: ContactChannel['verificationStatus']
      verifiedAt?: Date | null
      verificationDetail?: object | null
    },
    now: Date,
  ): Contact {
    const existing = this.props.channels.find((ch) => ch.id === channelId)
    if (!existing) {
      throw new NotFoundError(`Channel ${channelId} not found on contact ${this.props.id}`)
    }

    const settingPrimary = changes.isPrimary === true

    const updated = this.props.channels.map((ch) => {
      if (ch.id === channelId) {
        return {
          ...ch,
          channelType: changes.channelType ?? ch.channelType,
          value: changes.value ?? ch.value,
          isPrimary: changes.isPrimary !== undefined ? changes.isPrimary : ch.isPrimary,
          updatedAt: now,
          // Apply verification fields when provided; otherwise preserve the existing values.
          verificationStatus: changes.verificationStatus !== undefined ? changes.verificationStatus : ch.verificationStatus,
          verifiedAt: changes.verifiedAt !== undefined ? changes.verifiedAt : ch.verifiedAt,
          verificationDetail: changes.verificationDetail !== undefined ? changes.verificationDetail : ch.verificationDetail,
        }
      }
      if (settingPrimary && ch.isPrimary) {
        return { ...ch, isPrimary: false, updatedAt: now }
      }
      return ch
    })

    return this.withProps({ channels: updated, updatedAt: now })
  }

  removeChannel(channelId: string, now: Date): Contact {
    const exists = this.props.channels.some((ch) => ch.id === channelId)
    if (!exists) {
      throw new NotFoundError(`Channel ${channelId} not found on contact ${this.props.id}`)
    }

    return this.withProps({
      channels: this.props.channels.filter((ch) => ch.id !== channelId),
      updatedAt: now,
    })
  }

  addAssignment(assignment: ContactAssignment): Contact {
    const alreadyAssigned = this.props.assignments.some((a) => a.userId === assignment.userId)
    if (alreadyAssigned) {
      throw new BusinessRuleError(`User ${assignment.userId} is already assigned to contact ${this.props.id}`)
    }

    return this.withProps({
      assignments: [...this.props.assignments, assignment],
      updatedAt: assignment.createdAt,
    })
  }

  updateAssignmentRole(userId: string, role: ContactAssignmentRole, now: Date): Contact {
    const existing = this.props.assignments.find((a) => a.userId === userId)
    if (!existing) {
      throw new NotFoundError(`Assignment for user ${userId} not found on contact ${this.props.id}`)
    }

    const updated = this.props.assignments.map((a) =>
      a.userId === userId ? { ...a, role, updatedAt: now } : a,
    )

    return this.withProps({ assignments: updated, updatedAt: now })
  }

  removeAssignment(userId: string, now: Date): Contact {
    const exists = this.props.assignments.some((a) => a.userId === userId)
    if (!exists) {
      throw new NotFoundError(`Assignment for user ${userId} not found on contact ${this.props.id}`)
    }

    return this.withProps({
      assignments: this.props.assignments.filter((a) => a.userId !== userId),
      updatedAt: now,
    })
  }
}
