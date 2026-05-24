import { ValidationError, BusinessRuleError } from '@shared/errors'
import type { PipelineState } from '@modules/contacts/domain/types/pipeline-state'
import type { EventType } from '@modules/contacts/domain/types/event-type'
import type { SourceChannel } from '@modules/contacts/domain/types/source-channel'
import type { InterestLevel } from '@modules/contacts/domain/types/interest-level'
import type { ContactEvent } from '@modules/contacts/domain/entities/contact-event'
import type { ContactStateChange } from '@modules/contacts/domain/entities/contact-state-change'
import { resolveTargetState, isForwardTransition } from '@modules/contacts/domain/policies'

export interface ContactProps {
  readonly id: string
  readonly name: string
  readonly phone: string | null
  readonly pipelineState: PipelineState
  readonly stateLocked: boolean
  readonly sourceChannel: SourceChannel | null
  readonly interestLevel: InterestLevel | null
  readonly createdBy: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
  readonly events: readonly ContactEvent[]
  readonly stateChanges: readonly ContactStateChange[]
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
    phone?: string | null
    sourceChannel?: SourceChannel | null
    interestLevel?: InterestLevel | null
    createdBy: string
    createdAt: Date
    updatedAt: Date
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

    const props: ContactProps = {
      id: params.id,
      name: params.name.trim(),
      phone: params.phone ?? null,
      pipelineState: 'Contact',
      stateLocked: false,
      sourceChannel: params.sourceChannel ?? null,
      interestLevel: params.interestLevel ?? null,
      createdBy: params.createdBy,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      deletedAt: null,
      events: [],
      stateChanges: [],
    }

    return new Contact(props, [], [])
  }

  static reconstitute(props: ContactProps): Contact {
    return new Contact(props, [], [])
  }

  get id(): string { return this.props.id }
  get name(): string { return this.props.name }
  get phone(): string | null { return this.props.phone }
  get pipelineState(): PipelineState { return this.props.pipelineState }
  get stateLocked(): boolean { return this.props.stateLocked }
  get sourceChannel(): SourceChannel | null { return this.props.sourceChannel }
  get interestLevel(): InterestLevel | null { return this.props.interestLevel }
  get createdBy(): string { return this.props.createdBy }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }
  get deletedAt(): Date | null { return this.props.deletedAt }
  get events(): readonly ContactEvent[] { return this.props.events }
  get stateChanges(): readonly ContactStateChange[] { return this.props.stateChanges }
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
    const event: ContactEvent = {
      id: params.eventId,
      contactId: this.props.id,
      authorId: params.authorId,
      eventType: params.eventType,
      detail: params.detail,
      occurredAt: params.occurredAt,
      createdAt: params.now,
    }

    const targetState = resolveTargetState(params.eventType)
    const currentState = this.props.pipelineState
    const now = params.now

    let nextProps = {
      ...this.props,
      events: [...this.props.events, event],
      updatedAt: now,
    }

    const newPendingEvents = [...this.pendingEvents, event]
    const newPendingStateChanges = [...this.pendingStateChanges]

    if (targetState !== null && !this.props.stateLocked && isForwardTransition(currentState, targetState)) {
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

  changeStateManually(params: {
    stateChangeId: string
    newState: PipelineState
    userId: string
    now: Date
  }): Contact {
    if (this.props.deletedAt !== null) {
      throw new BusinessRuleError('Cannot change state of a deleted contact')
    }

    const currentState = this.props.pipelineState

    if (currentState === params.newState) {
      return this
    }

    const stateChange: ContactStateChange = {
      id: params.stateChangeId,
      contactId: this.props.id,
      previousState: currentState,
      nextState: params.newState,
      cause: { kind: 'manual', userId: params.userId },
      changedAt: params.now,
      createdAt: params.now,
    }

    const nextProps: ContactProps = {
      ...this.props,
      pipelineState: params.newState,
      stateLocked: true,
      updatedAt: params.now,
      stateChanges: [...this.props.stateChanges, stateChange],
    }

    return new Contact(nextProps, [...this.pendingEvents], [...this.pendingStateChanges, stateChange])
  }

  softDelete(now: Date): Contact {
    if (this.props.deletedAt !== null) {
      return this
    }

    const nextProps: ContactProps = {
      ...this.props,
      deletedAt: now,
      updatedAt: now,
    }

    return new Contact(nextProps, [...this.pendingEvents], [...this.pendingStateChanges])
  }
}
