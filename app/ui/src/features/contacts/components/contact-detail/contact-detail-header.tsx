import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { interestLevelLabels, pipelineStateLabels, sourceChannelLabels } from '@features/contacts/constants/contacts.options'
import { interestLevelBadge, pipelineStateBadge, sourceChannelBadge } from '@features/contacts/constants/status-color-badge.constat'
import { useDeleteContact } from '@features/contacts/hooks/use-contact-mutations'
import type { ContactView } from '@shared/api/types/ContactView'
import { Avatar } from '@shared/ui/avatar'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { DeleteDialog } from '@shared/ui/delete-dialog'

type Props = {
  contact: ContactView
  onRegisterEvent: () => void
}

export function ContactDetailHeader({ contact, onRegisterEvent }: Props) {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { deleteContact, isPending: isDeleting } = useDeleteContact(contact.id)

  async function handleConfirmDelete() {
    try {
      await deleteContact()
      setDeleteOpen(false)
      navigate({ to: '/contacts' })
    } catch {
      toast.error('Error al eliminar el contacto')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={contact.name} size="md" />
          <div className="flex flex-col gap-1">
            <h1 className="text-[length:var(--ds-font-size-xl)] font-[var(--ds-font-weight-semibold)] text-foreground leading-tight">
              {contact.name}
            </h1>
            <span className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
              {contact.channels.find((ch) => ch.isPrimary)?.value ?? '—'}
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant={pipelineStateBadge[contact.pipelineState]}>
                {pipelineStateLabels[contact.pipelineState]}
              </Badge>
              {contact.interestLevel && (
                <Badge variant={interestLevelBadge[contact.interestLevel]}>
                  {interestLevelLabels[contact.interestLevel]}
                </Badge>
              )}
              {contact.sourceChannel && (
                <Badge variant={sourceChannelBadge[contact.sourceChannel]}>
                  {sourceChannelLabels[contact.sourceChannel]}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="default" size="sm" onClick={onRegisterEvent}>
            Registrar evento
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Eliminar
          </Button>
        </div>
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar contacto"
        content={`¿Eliminar a ${contact.name}? Esta acción no se puede deshacer.`}
        onDeleted={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
