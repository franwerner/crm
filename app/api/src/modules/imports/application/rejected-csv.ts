// Accumulates rejected/duplicate rows during an import run and serialises them
// to a UTF-8 CSV buffer for upload to MinIO.

export interface RejectedRow {
  rowNumber: number
  reason: string
}

export class RejectedCsvBuilder {
  private readonly rows: RejectedRow[] = []

  add(row: RejectedRow): void {
    this.rows.push(row)
  }

  isEmpty(): boolean {
    return this.rows.length === 0
  }

  /**
   * Serialises to a UTF-8 CSV buffer with a header line followed by one data
   * line per rejected row. Values that contain commas or quotes are quoted and
   * inner quotes are escaped.
   */
  toCsvBuffer(): Buffer {
    const escape = (v: string): string => {
      if (v.includes(',') || v.includes('"') || v.includes('\n')) {
        return `"${v.replace(/"/g, '""')}"`
      }
      return v
    }

    const lines: string[] = ['row_number,reason']
    for (const row of this.rows) {
      lines.push(`${row.rowNumber},${escape(row.reason)}`)
    }

    return Buffer.from(lines.join('\n'), 'utf-8')
  }
}
