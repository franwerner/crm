export interface LLMCompletion {
  content: string
  modelUsed: string
  promptTokens: number
  completionTokens: number
}

export interface LLMProvider {
  complete(params: {
    systemPrompt: string
    userContent: string
    model: string
  }): Promise<LLMCompletion>
}
