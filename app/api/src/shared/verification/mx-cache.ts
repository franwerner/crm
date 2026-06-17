// Port — zero runtime dependencies; no ioredis import allowed here.
// The adapter (IoredisÞMxCache) lives in the consuming slice's infrastructure layer.

export interface MxCache {
  get(domain: string): Promise<string[] | null>
  set(domain: string, records: string[], ttlSeconds: number): Promise<void>
}
