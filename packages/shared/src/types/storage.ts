export interface StorageService {
  upload(key: string, data: Buffer, contentType: string): Promise<void>
  download(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>
}

export interface StorageConfig {
  provider: "local" | "s3" | "r2" | "supabase"
  bucket: string
  region?: string
  endpoint?: string
  accessKey?: string
  secretKey?: string
}
