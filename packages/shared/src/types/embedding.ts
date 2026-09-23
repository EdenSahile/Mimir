export interface EmbeddingService {
  generate(text: string): Promise<number[]>
  generateBatch(texts: string[]): Promise<number[][]>
  getDimension(): number
}

export interface EmbeddingConfig {
  provider: string
  model: string
  dimension: number
  apiKey?: string
  endpoint?: string
}
