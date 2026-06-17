/**
 * In-memory dedup index for a single import run.
 * Tracks emails and phones seen within the current file to detect intra-file
 * duplicates (R4.2). Each instance is independent — one per import job.
 *
 * Normalisation: lower-case trim for email; digits-only prefix comparison is
 * left to the caller (E.164 is already normalised by ChannelChecker before calling add).
 */
export class DedupIndex {
  private readonly seenEmails = new Set<string>()
  private readonly seenPhones = new Set<string>()

  /**
   * Returns true if neither the email nor the phone was seen before, then records
   * both. Returns false (duplicate) when at least one is already in the index.
   * Undefined arguments are ignored.
   */
  add(email?: string, phone?: string): boolean {
    const normalEmail = email?.toLowerCase().trim()
    const normalPhone = phone?.trim()

    const seenEmail = normalEmail !== undefined && this.seenEmails.has(normalEmail)
    const seenPhone = normalPhone !== undefined && this.seenPhones.has(normalPhone)

    if (seenEmail || seenPhone) {
      return false
    }

    if (normalEmail !== undefined) this.seenEmails.add(normalEmail)
    if (normalPhone !== undefined) this.seenPhones.add(normalPhone)

    return true
  }
}
