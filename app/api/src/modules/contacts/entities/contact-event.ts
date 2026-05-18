import type { EventType } from '../types/event-type'

export interface ContactEvent {
  readonly id: string
  readonly contactId: string
  readonly authorId: string
  readonly eventType: EventType
  readonly detail: string
  readonly occurredAt: Date
  readonly createdAt: Date
}
