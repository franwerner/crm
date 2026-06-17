import { useState } from 'react'
import { FileDropzone } from '@shared/ui/file-dropzone'
import { Button } from '@shared/ui/button'
import { useUploadImport } from '@features/imports/hooks/use-upload-import'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
// 20 MB — mirrors the backend limit
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

export interface UploadStepData {
  importId: string
  columnHeaders: string[]
}

interface UploadStepProps {
  onComplete: (data: UploadStepData) => void
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const [files, setFiles] = useState<File[]>([])
  const { uploadImport, isPending, errorMessage } = useUploadImport()

  async function handleSubmit() {
    const file = files[0]
    if (!file) return
    const result = await uploadImport(file)
    onComplete({ importId: result.importId, columnHeaders: result.columnHeaders })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[length:var(--ds-font-size-sm)] text-muted-foreground">
        Subí un archivo Excel (.xlsx) con los contactos a importar.
      </p>

      <FileDropzone
        accept={[XLSX_MIME]}
        value={files}
        onChange={setFiles}
        maxSizeBytes={MAX_FILE_SIZE_BYTES}
        multiple={false}
        disabled={isPending}
        hint="Solo archivos .xlsx, hasta 20 MB"
      />

      {errorMessage && (
        <p className="text-[length:var(--ds-font-size-sm)] text-destructive">{errorMessage}</p>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={files.length === 0 || isPending}
        >
          {isPending ? 'Subiendo…' : 'Siguiente'}
        </Button>
      </div>
    </div>
  )
}
