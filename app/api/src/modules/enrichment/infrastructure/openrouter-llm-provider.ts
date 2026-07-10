// OpenRouter adapter using the OpenAI-compatible SDK.
// The SDK v4+ uses fetch natively; on Bun this maps to the native Bun fetch (EDR D3).
import OpenAI from 'openai'
import type { LLMProvider, LLMCompletion } from '@modules/enrichment/domain/llm-provider'

export class OpenRouterLLMProvider implements LLMProvider {
  private readonly client: OpenAI

  constructor(apiKey: string, baseURL: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
      // Explicitly use the global fetch to ensure Bun's native fetch is used (not node:http)
      fetch: globalThis.fetch,
    })
  }

  async complete(params: {
    systemPrompt: string
    userContent: string
    model: string
  }): Promise<LLMCompletion> {
    const response = await this.client.chat.completions.create({
      model: params.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userContent },
      ],
      // Omit response_format: free models may not support json_object mode.
      // The system prompt instructs JSON-only output; we validate shape with zod.
    })

    const choice = response.choices[0]
    const content = choice?.message?.content ?? ''
    const usage = response.usage

    return {
      content,
      modelUsed: response.model ?? params.model,
      promptTokens: usage?.prompt_tokens ?? 0,
      completionTokens: usage?.completion_tokens ?? 0,
    }
  }
}
