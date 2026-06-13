import * as React from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '@shared/lib/utils/cn'

export type FileDropzoneProps = {
  accept: string[]
  value: File[]
  onChange: (files: File[]) => void
  maxSizeBytes?: number
  multiple?: boolean
  disabled?: boolean
  hint?: React.ReactNode
  className?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileDropzone({
  accept,
  value,
  onChange,
  maxSizeBytes,
  multiple = false,
  disabled = false,
  hint,
  className,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])

  function validate(file: File): string | null {
    if (file.size <= 0) return `${file.name}: archivo vacío`
    if (accept.length > 0 && !accept.includes(file.type)) return `${file.name}: tipo no permitido`
    if (maxSizeBytes && file.size > maxSizeBytes) return `${file.name}: supera ${formatBytes(maxSizeBytes)}`
    return null
  }

  function addFiles(incoming: File[]) {
    const accepted: File[] = []
    const nextErrors: string[] = []
    for (const file of incoming) {
      const error = validate(file)
      if (error) nextErrors.push(error)
      else accepted.push(file)
    }
    setErrors(nextErrors)
    if (accepted.length === 0) return

    if (!multiple) {
      onChange([accepted[0]!])
      return
    }
    const merged = [...value]
    for (const file of accepted) {
      if (!merged.some((m) => m.name === file.name && m.size === file.size)) merged.push(file)
    }
    onChange(merged)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    addFiles(Array.from(e.dataTransfer.files))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(Array.from(e.target.files))
    e.target.value = ''
  }

  function removeFile(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function openPicker() {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-[var(--ds-radius-md)] border-[1.5px] border-dashed border-brand px-4 py-8 text-center transition-colors',
          'focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[var(--ds-shadow-focus)]',
          isDragging && 'border-primary bg-muted',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-muted',
        )}
      >
        <Upload className="size-6 text-muted-foreground" />
        <span className="text-[length:var(--ds-font-size-sm)] text-foreground">
          Arrastrá {multiple ? 'archivos' : 'un archivo'} o hacé clic para elegir
        </span>
        {hint && (
          <span className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">{hint}</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="hidden"
      />

      {errors.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {errors.map((error, i) => (
            <li key={i} className="text-[length:var(--ds-font-size-xs)] text-destructive">
              {error}
            </li>
          ))}
        </ul>
      )}

      {value.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-[var(--ds-radius-md)] border border-border">
          {value.map((file, i) => (
            <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-[length:var(--ds-font-size-sm)] text-foreground">
                {file.name}
              </span>
              <span className="shrink-0 text-[length:var(--ds-font-size-xs)] text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                disabled={disabled}
                aria-label={`Quitar ${file.name}`}
                className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
