// Port for spreadsheet reading — no exceljs/filesystem import allowed here.
// The adapter (XlsxRowStream) lives in imports/infrastructure and is injected by DI.

export interface SpreadsheetReader {
  /**
   * Reads the first row of a spreadsheet stored at the given MinIO key (downloaded
   * to a temp path by the adapter) and returns the non-blank header values.
   */
  readHeaders(fileKey: string): Promise<string[]>

  /**
   * Counts data rows (excluding the header) in the spreadsheet.
   * Used for the counting pass (stage=counting).
   */
  countRows(fileKey: string): Promise<number>

  /**
   * Streams data rows from the spreadsheet, skipping rows whose row.number is
   * ≤ fromRowNumber (resume support, D7). Blank rows are skipped.
   * The callback receives the 1-indexed values array (exceljs row.values shape)
   * and the original row.number.
   */
  streamRows(
    fileKey: string,
    fromRowNumber: number,
    onRow: (rowValues: unknown[], rowNumber: number) => Promise<void>,
  ): Promise<void>
}
