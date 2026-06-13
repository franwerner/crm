import type { ObjectStorage } from './object-storage'

export interface ObjectStorageConfig {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
}

export class BunObjectStorage implements ObjectStorage {
  private readonly client: InstanceType<typeof Bun.S3Client>

  constructor(config: ObjectStorageConfig) {
    this.client = new Bun.S3Client({
      endpoint: config.endpoint,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      bucket: config.bucket,
      region: config.region,
    })
  }

  async putObject(key: string, body: Blob, contentType: string): Promise<void> {
    await this.client.write(key, body, { type: contentType })
  }

  async getPresignedDownloadUrl(key: string, ttlSeconds: number): Promise<string> {
    return this.client.presign(key, { expiresIn: ttlSeconds, method: 'GET' })
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.client.delete(key)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('NoSuchKey') || msg.includes('404')) return
      throw err
    }
  }

  async headObject(key: string): Promise<{ size: number; contentType: string } | null> {
    try {
      const stats = await this.client.stat(key)
      return { size: stats.size, contentType: stats.type }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('NoSuchKey') || msg.includes('404') || msg.includes('does not exist')) return null
      throw err
    }
  }
}
