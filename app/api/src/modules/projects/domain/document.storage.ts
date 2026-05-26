export interface DocumentStorage {
  putObject(key: string, body: Blob, contentType: string): Promise<void>
  getPresignedDownloadUrl(key: string, ttlSeconds: number): Promise<string>
  deleteObject(key: string): Promise<void>
  headObject(key: string): Promise<{ size: number; contentType: string } | null>
}
