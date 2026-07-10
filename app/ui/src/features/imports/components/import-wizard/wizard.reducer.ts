// Wizard state machine for the import flow.
// EDR: frontend/multistep-wizard-usereducer — useReducer + Dialog, reducer pure, each step has onComplete(data).
//
// Flow: upload → mapping (collect mapping locally) → template (confirm analyze options + fire PATCH) → processing
// The PATCH /imports/:id/mapping is submitted at the template step so analyzeOnComplete/enrichmentTemplateId
// can be sent in a single request alongside the column mapping.

export type WizardStep = 'upload' | 'mapping' | 'template' | 'processing'

export interface WizardState {
  step: WizardStep
  importId: string | null
  columnHeaders: string[]
  // Collected in the mapping step; submitted in the template step (single PATCH)
  pendingMapping: Record<string, string>
  // Set during the template step
  analyzeOnComplete: boolean
  enrichmentTemplateId: string | null
}

export type WizardAction =
  | { type: 'UPLOAD_COMPLETE'; importId: string; columnHeaders: string[] }
  // Skips upload and lands directly on the mapping step for awaiting_mapping imports
  | { type: 'RESUME_MAPPING'; importId: string; columnHeaders: string[] }
  | { type: 'MAPPING_COMPLETE'; mapping: Record<string, string> }
  // Return from the template step to mapping, keeping importId/columnHeaders/pendingMapping
  | { type: 'BACK_TO_MAPPING' }
  | { type: 'TEMPLATE_COMPLETE'; analyzeOnComplete: boolean; enrichmentTemplateId: string | null }
  | { type: 'RESET' }

export const initialWizardState: WizardState = {
  step: 'upload',
  importId: null,
  columnHeaders: [],
  pendingMapping: {},
  analyzeOnComplete: false,
  enrichmentTemplateId: null,
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'UPLOAD_COMPLETE':
    case 'RESUME_MAPPING':
      return {
        ...state,
        step: 'mapping',
        importId: action.importId,
        columnHeaders: action.columnHeaders,
      }
    case 'MAPPING_COMPLETE':
      // Store the mapping locally; the actual PATCH is fired in the template step
      // so analyzeOnComplete/enrichmentTemplateId are sent in a single request.
      return { ...state, step: 'template', pendingMapping: action.mapping }
    case 'BACK_TO_MAPPING':
      // Keep pendingMapping so the mapping step is pre-filled; no re-upload needed.
      return { ...state, step: 'mapping' }
    case 'TEMPLATE_COMPLETE':
      return {
        ...state,
        step: 'processing',
        analyzeOnComplete: action.analyzeOnComplete,
        enrichmentTemplateId: action.enrichmentTemplateId,
      }
    case 'RESET':
      return initialWizardState
    default:
      return state
  }
}
