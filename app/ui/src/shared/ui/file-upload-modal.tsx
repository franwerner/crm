import * as React from 'react'
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
import { FileDropzone } from '@shared/ui/file-dropzone'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  accept: string[]
  maxSizeBytes?: number
  multiple?: boolean
  hint?: React.ReactNode
  onUpload: (files: File[]) => Promise<void>
  isPending?: boolean
  errorMessage?: string | null
  submitLabel?: string
  pendingLabel?: string
}

export function FileUploadModal({
  open,
  onOpenChange,
  title,
  description,
  accept,
  maxSizeBytes,
  multiple = false,
  hint,
  onUpload,
  isPending = false,
  errorMessage,
  submitLabel = 'Subir',
  pendingLabel = 'Subiendo…',
}: Props) {
  const [files, setFiles] = React.useState<File[]>([])

  function handleOpenChange(next: boolean) {
    if (!next) setFiles([])
    onOpenChange(next)
  }

  async function handleUpload() {
    const succeeded = await onUpload(files).then(() => true, () => false)
    if (succeeded) {
      setFiles([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        <DialogDescription>{description ?? title}</DialogDescription>
        <DialogBody>
          <FileDropzone
            accept={accept}
            value={files}
            onChange={setFiles}
            maxSizeBytes={maxSizeBytes}
            multiple={multiple}
            hint={hint}
            disabled={isPending}
          />
          {errorMessage && (
            <p className="mt-3 text-[length:var(--ds-font-size-sm)] text-destructive">{errorMessage}</p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={isPending || files.length === 0}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
