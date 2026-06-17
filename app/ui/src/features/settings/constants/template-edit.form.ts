import type { FormDescriptor } from '@shared/lib/form-view/types'
import type { PatchAnalysisTemplatesIdMutationRequest } from '@shared/api/types/PatchAnalysisTemplatesId'

// modelProvider options kept in sync with template.form.ts
const MODEL_PROVIDER_OPTIONS = [
  { value: 'openai/gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (OpenAI)' },
  { value: 'anthropic/claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (Anthropic)' },
  { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5 (Google)' },
] as const

export const templateEditForm: FormDescriptor<PatchAnalysisTemplatesIdMutationRequest> = {
  name: 'template-edit',
  fields: [
    { key: 'name', label: 'Nombre', widget: 'text', required: true, placeholder: 'Ej. Análisis de leads B2B' },
    { key: 'rubro', label: 'Rubro', widget: 'text', required: false, placeholder: 'Ej. Tecnología, Salud…' },
    {
      key: 'prompt',
      label: 'Prompt',
      widget: 'textarea',
      required: true,
      placeholder: 'Describe qué debe analizar el modelo…',
    },
    {
      key: 'modelProvider',
      label: 'Modelo',
      widget: 'select',
      required: false,
      options: MODEL_PROVIDER_OPTIONS,
      placeholder: 'Seleccionar modelo…',
    },
  ],
}
