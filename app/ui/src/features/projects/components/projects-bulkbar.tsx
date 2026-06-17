import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { DeleteDialog } from '@shared/ui/delete-dialog'

type Props = {
  count: number
  onDelete: () => void
  isDeleting?: boolean
}

export function ProjectsBulkbar({ count, onDelete, isDeleting }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  function handleDeleted() {
    setConfirmOpen(false)
    onDelete()
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-[var(--ds-font-weight-semibold)] text-foreground">
        {count} {count === 1 ? 'seleccionado' : 'seleccionados'}
      </span>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={isDeleting}
      >
        <Trash2 />
        Eliminar
      </Button>

      <DeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar proyectos"
        content={`¿Eliminar ${count} ${count === 1 ? 'proyecto' : 'proyectos'}? Esta acción no se puede deshacer.`}
        onDeleted={handleDeleted}
        isDeleting={isDeleting}
      />
    </div>
  )
}
