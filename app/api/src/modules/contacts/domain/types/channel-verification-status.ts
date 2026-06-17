// Mirrors the pgEnum contact_verification_status — kept in domain so the entity
// doesn't depend on shared/verification (ADR adr02-1-domain-purity).
export type ChannelVerificationStatus = 'unverified' | 'valid' | 'invalid'
