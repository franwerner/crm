// Bun.redis adapter for MxCache — uses the native Bun.RedisClient (no ioredis).
// Per EDR redis.md: Bun.redis is used for all non-BullMQ Redis uses;
// ioredis is exclusive to queue.bullmq.ts (EDR ioredis.md).
import type { MxCache } from './mx-cache'

const MX_KEY_PREFIX = 'mx:'

/**
 * Redis-backed MxCache using the native Bun.RedisClient.
 * TTL is per-domain (1 hour); records are stored as a JSON array.
 */
export class BunRedisMxCache implements MxCache {
  private readonly client: Bun.RedisClient

  constructor(redisUrl: string) {
    this.client = new Bun.RedisClient(redisUrl)
  }

  async get(domain: string): Promise<string[] | null> {
    const key = `${MX_KEY_PREFIX}${domain}`
    const raw = await this.client.get(key)
    if (raw === null || raw === undefined) return null
    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) return parsed as string[]
      return null
    } catch {
      // Corrupt cache entry — treat as a miss.
      return null
    }
  }

  async set(domain: string, records: string[], ttlSeconds: number): Promise<void> {
    const key = `${MX_KEY_PREFIX}${domain}`
    await this.client.set(key, JSON.stringify(records), 'EX', ttlSeconds)
  }
}
