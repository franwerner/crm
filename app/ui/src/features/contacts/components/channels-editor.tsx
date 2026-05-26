import { Trash2 } from 'lucide-react'
import type { ChannelsChannelTypeEnum2Key } from '@shared/api/types/CreateContactBody'
import { channelTypeOptions } from '@features/contacts/constants/contacts.options'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/select'

export type ChannelInput = {
  channelType: ChannelsChannelTypeEnum2Key
  value: string
  isPrimary: boolean
}

type Props = {
  value: ChannelInput[]
  onChange: (next: ChannelInput[]) => void
}

function emptyChannel(): ChannelInput {
  return { channelType: 'Phone', value: '', isPrimary: false }
}

export function ChannelsEditor({ value: channels, onChange }: Props) {
  function addChannel() {
    onChange([...channels, emptyChannel()])
  }

  function removeChannel(index: number) {
    onChange(channels.filter((_, i) => i !== index))
  }

  function updateChannel(index: number, patch: Partial<ChannelInput>) {
    const next = channels.map((ch, i) => (i === index ? { ...ch, ...patch } : ch))
    onChange(next)
  }

  function setPrimary(index: number) {
    const next = channels.map((ch, i) => ({ ...ch, isPrimary: i === index }))
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <Label>Canales de comunicación</Label>

      {channels.length > 0 && (
        <div className="flex flex-col gap-2">
          {channels.map((ch, i) => (
            <div key={i} className="flex items-center gap-2">
              <Select
                value={ch.channelType}
                onValueChange={(v) => updateChannel(i, { channelType: v as ChannelsChannelTypeEnum2Key })}
              >
                <SelectTrigger size="sm" className="w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channelTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                className="h-8 flex-1 text-sm"
                placeholder="Número, URL o usuario"
                value={ch.value}
                onChange={(e) => updateChannel(i, { value: e.target.value })}
              />

              <button
                type="button"
                title={ch.isPrimary ? 'Canal principal' : 'Marcar como principal'}
                onClick={() => setPrimary(i)}
                className={[
                  'shrink-0 rounded-full border-[1.5px] px-2 py-0.5 text-xs font-medium transition-colors',
                  'border-brand',
                  ch.isPrimary
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted',
                ].join(' ')}
              >
                Principal
              </button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeChannel(i)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addChannel} className="self-start">
        + Agregar canal
      </Button>
    </div>
  )
}
