import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'
import { Timeline, TimelineItem, TimelineContent, TimelineMeta, TimelineQuote } from '@shared/ui/timeline'
import type { ContactEventView, ContactEventViewEventTypeEnumKey } from '@shared/api/types/ContactEventView'
import { eventTypeLabels } from '@features/contacts/constants/contacts.options'
import { formatDateTime } from '@shared/lib/utils/date'

const warnTypes: ContactEventViewEventTypeEnumKey[] = ['ProposalRejected', 'FollowUpPending']

type Props = {
  events: ContactEventView[]
  total: number
  isLoading: boolean
}

export function ContactActivityTimeline({ events, total, isLoading }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )

  const hasMore = total > events.length

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-[length:var(--ds-font-size-md)]">Actividad</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">Cargando…</p>
        ) : sorted.length === 0 ? (
          <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground py-2">
            Sin eventos registrados.
          </p>
        ) : (
          <>
            <Timeline>
              {sorted.map((event) => (
                <TimelineItem
                  key={event.id}
                  dot={warnTypes.includes(event.eventType) ? 'warn' : 'user'}
                >
                  <TimelineContent>
                    <span className="font-[var(--ds-font-weight-medium)] text-foreground">
                      {eventTypeLabels[event.eventType]}
                    </span>
                    {event.detail && <TimelineQuote>{event.detail}</TimelineQuote>}
                    <TimelineMeta>
                      {formatDateTime(event.occurredAt)}
                    </TimelineMeta>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
            {hasMore && (
              <div className="pt-2 text-center text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                Mostrando {sorted.length} de {total}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
