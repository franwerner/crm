import { ValidationError } from '@shared/errors'

// Contact fields that can be mapped; at least one "identity" field (email or phone)
// must be present for dedup and contact creation to be meaningful.
const REQUIRED_IDENTITY_FIELDS = ['email', 'phone'] as const
const KNOWN_CONTACT_FIELDS = [
  'email',
  'phone',
  'name',
  'notes',
  'contactType',
  'sex',
  'sourceChannel',
  'interestLevel',
  'addressStreet',
  'addressNumber',
  'addressPostalCode',
  'addressCity',
  'addressProvince',
  'addressCountry',
] as const

export type KnownContactField = (typeof KNOWN_CONTACT_FIELDS)[number]

/**
 * Validates that a column→field mapping covers at least one identity field
 * (email or phone) so dedup and contact creation are possible.
 *
 * Pure function — no I/O.
 */
export function validateMapping(
  _headers: string[],
  mapping: Record<string, string>,
): { ok: true } | { ok: false; error: ValidationError } {
  const mappedFields = Object.values(mapping)
  const hasIdentity = REQUIRED_IDENTITY_FIELDS.some((f) => mappedFields.includes(f))

  if (!hasIdentity) {
    return {
      ok: false,
      error: new ValidationError('Mapping must include at least one identity field (email or phone)', [
        { field: 'mapping', message: 'At least one column must be mapped to "email" or "phone"' },
      ]),
    }
  }

  return { ok: true }
}

/**
 * Returns the batch size clamped to [200, 2000] per D7.
 * batchSize = clamp(ceil(totalRows / 100), 200, 2000)
 */
export function calcBatchSize(totalRows: number): number {
  const raw = Math.ceil(totalRows / 100)
  return Math.min(Math.max(raw, 200), 2000)
}
