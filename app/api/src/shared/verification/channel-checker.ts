// Port — zero runtime dependencies; no infrastructure import allowed here.

export type VerificationStatus = 'valid' | 'invalid' | 'unverified'

export interface VerificationResult {
  status: VerificationStatus
  verifiedAt: Date
  detail: object
}

export type ChannelType = 'email' | 'phone'

export interface ChannelChecker {
  verify(channelType: ChannelType, value: string): Promise<VerificationResult>
}
