import { useEffect, useReducer } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseButton,
  DialogBody,
} from '@shared/ui/dialog'
import { Loader2 } from 'lucide-react'
import { useGetImportsId } from '@shared/api/hooks/useGetImportsId'
import { wizardReducer, initialWizardState } from './wizard.reducer'
import { UploadStep } from './steps/upload-step'
import { MappingStep } from './steps/mapping-step'
import { TemplateStep } from './steps/template-step'
import { ProcessingStep } from './steps/processing-step'
import type { UploadStepData } from './steps/upload-step'
import type { MappingStepData } from './steps/mapping-step'
import type { TemplateStepData } from './steps/template-step'

const STEP_LABELS: Record<string, string> = {
  upload: 'Subir archivo',
  mapping: 'Mapear columnas',
  template: 'Configurar análisis',
  processing: 'Procesando',
}

const STEP_ORDER = ['upload', 'mapping', 'template', 'processing'] as const

interface ImportWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When set, skip upload and land directly on the mapping step for this import. */
  resumeImportId?: string | null
}

export function ImportWizard({ open, onOpenChange, resumeImportId }: ImportWizardProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState)

  // Fetch the import detail only when resuming an existing import
  const { data: resumeData, isLoading: isResumeLoading } = useGetImportsId(
    resumeImportId ?? undefined,
    { query: { enabled: open && !!resumeImportId } },
  )

  // Dispatch RESUME_MAPPING once the detail arrives, guarded by step === 'upload'
  // so it only fires once (not on every re-render after the wizard is already in mapping).
  useEffect(() => {
    if (open && resumeImportId && resumeData && state.step === 'upload') {
      dispatch({
        type: 'RESUME_MAPPING',
        importId: resumeData.importId,
        columnHeaders: resumeData.columnHeaders,
      })
    }
  }, [open, resumeImportId, resumeData, state.step])

  function handleClose() {
    dispatch({ type: 'RESET' })
    onOpenChange(false)
  }

  function handleUploadComplete(data: UploadStepData) {
    dispatch({
      type: 'UPLOAD_COMPLETE',
      importId: data.importId,
      columnHeaders: data.columnHeaders,
    })
  }

  function handleMappingComplete(data: MappingStepData) {
    dispatch({ type: 'MAPPING_COMPLETE', mapping: data.mapping })
  }

  function handleTemplateComplete(data: TemplateStepData) {
    dispatch({
      type: 'TEMPLATE_COMPLETE',
      analyzeOnComplete: data.analyzeOnComplete,
      enrichmentTemplateId: data.enrichmentTemplateId,
    })
  }

  const currentStepIndex = STEP_ORDER.indexOf(state.step)
  const isLoadingResume = open && !!resumeImportId && isResumeLoading

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Only allow closing when not in an unrecoverable mid-processing state
        if (!nextOpen) handleClose()
      }}
    >
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex flex-col gap-0.5">
            <DialogTitle>Nueva ingesta</DialogTitle>
            <p className="text-[length:var(--ds-font-size-xs)] text-muted-foreground">
              Paso {currentStepIndex + 1} de {STEP_ORDER.length} — {STEP_LABELS[state.step]}
            </p>
          </div>
          <DialogCloseButton onClick={handleClose} />
        </DialogHeader>

        <DialogBody>
          {isLoadingResume ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {state.step === 'upload' && (
                <UploadStep onComplete={handleUploadComplete} />
              )}

              {state.step === 'mapping' && (
                <MappingStep
                  columnHeaders={state.columnHeaders}
                  initialMapping={state.pendingMapping}
                  onComplete={handleMappingComplete}
                />
              )}

              {state.step === 'template' && state.importId && (
                <TemplateStep
                  importId={state.importId}
                  pendingMapping={state.pendingMapping}
                  onBack={() => dispatch({ type: 'BACK_TO_MAPPING' })}
                  onComplete={handleTemplateComplete}
                />
              )}

              {state.step === 'processing' && state.importId && (
                <ProcessingStep
                  importId={state.importId}
                  onClose={handleClose}
                />
              )}
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
