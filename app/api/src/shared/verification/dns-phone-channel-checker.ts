import { resolveMx } from 'node:dns/promises'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js/min'
import { z } from 'zod'
import type { ChannelChecker, ChannelType, VerificationResult } from './channel-checker'
import type { MxCache } from './mx-cache'

const MX_LOOKUP_TIMEOUT_MS = 3_000
const MX_CACHE_TTL_SECONDS = 3_600 // 1 hour (D5)

const emailSchema = z.string().email()

export class DnsPhoneChannelChecker implements ChannelChecker {
  constructor(
    private readonly mxCache: MxCache,
    private readonly defaultPhoneRegion: string,
  ) {}

  async verify(channelType: ChannelType, value: string): Promise<VerificationResult> {
    if (channelType === 'email') {
      return this.verifyEmail(value)
    }
    return this.verifyPhone(value)
  }

  private async verifyEmail(value: string): Promise<VerificationResult> {
    const now = new Date()

    const syntaxResult = emailSchema.safeParse(value)
    if (!syntaxResult.success) {
      return {
        status: 'invalid',
        verifiedAt: now,
        detail: { reason: 'invalid_syntax', message: syntaxResult.error.issues[0]?.message ?? 'invalid email format' },
      }
    }

    const domain = value.split('@')[1]
    if (!domain) {
      return { status: 'invalid', verifiedAt: now, detail: { reason: 'no_domain' } }
    }

    try {
      const records = await this.resolveMxWithCache(domain)
      if (records.length === 0) {
        return { status: 'invalid', verifiedAt: now, detail: { reason: 'no_mx_records', domain } }
      }
      return { status: 'valid', verifiedAt: now, detail: { domain, mxCount: records.length } }
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === 'mx_lookup_timeout'
      return {
        status: 'unverified',
        verifiedAt: now,
        detail: {
          reason: isTimeout ? 'dns_timeout' : 'dns_error',
          domain,
          message: err instanceof Error ? err.message : String(err),
        },
      }
    }
  }

  private async resolveMxWithCache(domain: string): Promise<string[]> {
    const cached = await this.mxCache.get(domain)
    if (cached !== null) {
      return cached
    }

    // Race the DNS lookup against a hard timeout so a slow resolver never blocks ingestion (R8.5)
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('mx_lookup_timeout')), MX_LOOKUP_TIMEOUT_MS),
    )

    const entries = await Promise.race([resolveMx(domain), timeout])
    const records = entries.map((e) => e.exchange)

    await this.mxCache.set(domain, records, MX_CACHE_TTL_SECONDS)
    return records
  }

  private verifyPhone(value: string): VerificationResult {
    const now = new Date()

    try {
      if (!isValidPhoneNumber(value, this.defaultPhoneRegion as Parameters<typeof isValidPhoneNumber>[1])) {
        return { status: 'invalid', verifiedAt: now, detail: { reason: 'invalid_phone', value } }
      }
      const parsed = parsePhoneNumber(value, this.defaultPhoneRegion as Parameters<typeof parsePhoneNumber>[1])
      return {
        status: 'valid',
        verifiedAt: now,
        detail: { e164: parsed.format('E.164'), region: this.defaultPhoneRegion },
      }
    } catch (err) {
      return {
        status: 'invalid',
        verifiedAt: now,
        detail: {
          reason: 'parse_error',
          message: err instanceof Error ? err.message : String(err),
        },
      }
    }
  }
}
