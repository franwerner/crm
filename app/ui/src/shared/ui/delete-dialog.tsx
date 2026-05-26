import type { ReactNode } from 'react'
import { Button } from '@shared/ui/button'
import {
  Dialog,
  DialogBody,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: ReactNode
  onDeleted: () => void | Promise<void>
  isDeleting?: boolean
}

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  content,
  onDeleted,
  isDeleting = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription className="sr-only">{title}</DialogDescription>
        <DialogBody>{content}</DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDeleted()}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
