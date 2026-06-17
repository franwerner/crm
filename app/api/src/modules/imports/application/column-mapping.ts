// Maps an Excel row (1-indexed values array) to a ContactInput using the
// user-defined column→field mapping. Pure function — no I/O.

// Minimal shape of a contact to be created during ingestion.
// Keeps imports/application independent from the full contacts domain model.
export interface ContactInput {
  name?: string
  email?: string
  phone?: string
  notes?: string
  contactType?: string
  sex?: string
  sourceChannel?: string
  interestLevel?: string
  addressStreet?: string
  addressNumber?: string
  addressPostalCode?: string
  addressCity?: string
  addressProvince?: string
  addressCountry?: string
}

/**
 * Applies `mapping` (column index (1-based string key) → field name) to a
 * 1-indexed `rowValues` array (exceljs row.values — index 0 is null/undefined).
 *
 * Returns null when every mapped field resolves to a blank value (row is
 * effectively empty after mapping).
 */
export function mapRowToContactInput(
  rowValues: unknown[],
  mapping: Record<string, string>,
): ContactInput | null {
  const result: ContactInput = {}
  let hasValue = false

  for (const [colIndexStr, fieldName] of Object.entries(mapping)) {
    const colIndex = parseInt(colIndexStr, 10)
    if (Number.isNaN(colIndex)) continue

    const raw = rowValues[colIndex]
    if (raw === null || raw === undefined || String(raw).trim() === '') continue

    const value = String(raw).trim()
    hasValue = true

    switch (fieldName) {
      case 'name': result.name = value; break
      case 'email': result.email = value.toLowerCase(); break
      case 'phone': result.phone = value; break
      case 'notes': result.notes = value; break
      case 'contactType': result.contactType = value; break
      case 'sex': result.sex = value; break
      case 'sourceChannel': result.sourceChannel = value; break
      case 'interestLevel': result.interestLevel = value; break
      case 'addressStreet': result.addressStreet = value; break
      case 'addressNumber': result.addressNumber = value; break
      case 'addressPostalCode': result.addressPostalCode = value; break
      case 'addressCity': result.addressCity = value; break
      case 'addressProvince': result.addressProvince = value; break
      case 'addressCountry': result.addressCountry = value; break
      default: break // Unknown fields are silently ignored
    }
  }

  return hasValue ? result : null
}
