// Universal AI Client with Multi-Provider Support and Fallback Logic
import { AIProviderConfig, getProviderForTask, getEnabledProviders } from './providers'
import { checkRateLimit, recordRequest, getProviderWithCapacity } from './rate-limiter'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  taskType?: 'fast' | 'standard' | 'advanced'
  jsonMode?: boolean
}

export interface ChatCompletionResponse {
  content: string
  provider: string
  model: string
}

// Hugging Face specific request format
async function callHuggingFace(
  provider: AIProviderConfig,
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  const model = provider.models[options.taskType || 'standard']
  const url = `${provider.baseURL}/${model}`

  // Convert messages to Hugging Face format
  const prompt = options.messages
    .map((m) => {
      if (m.role === 'system') return `System: ${m.content}`
      if (m.role === 'user') return `User: ${m.content}`
      return `Assistant: ${m.content}`
    })
    .join('\n\n')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        return_full_text: false,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Hugging Face API error: ${error}`)
  }

  const data = await response.json()
  
  // Handle different response formats
  let content = ''
  if (Array.isArray(data)) {
    content = data[0]?.generated_text || ''
  } else if (data.generated_text) {
    content = data.generated_text
  } else {
    content = JSON.stringify(data)
  }

  return {
    content: content.trim(),
    provider: 'huggingface',
    model,
  }
}

// OpenAI-compatible API (works for Groq, OpenRouter, OpenAI)
async function callOpenAICompatible(
  provider: AIProviderConfig,
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  const model = provider.models[options.taskType || 'standard']

  const requestBody: any = {
    model,
    messages: options.messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000,
  }

  // JSON mode for structured outputs
  if (options.jsonMode) {
    requestBody.response_format = { type: 'json_object' }
  }

  // OpenRouter specific headers
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${provider.apiKey}`,
    'Content-Type': 'application/json',
  }

  if (provider.name === 'openrouter') {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    headers['X-Title'] = 'Shakes Digital Marketing Suite'
  }

  const response = await fetch(`${provider.baseURL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`${provider.name} API error: ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  return {
    content: content.trim(),
    provider: provider.name,
    model,
  }
}

// Main chat completion function with fallback logic
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  const providers = getEnabledProviders()

  if (providers.length === 0) {
    throw new Error('No AI providers configured. Please add API keys to .env.local')
  }

  // Try to use preferred provider for task type
  const preferredProvider = getProviderForTask(options.taskType || 'standard')
  if (preferredProvider) {
    // Check rate limits first
    const rateCheck = checkRateLimit(preferredProvider.name)
    
    if (rateCheck.allowed) {
      try {
        console.log(`[AI] Using ${preferredProvider.name} (${preferredProvider.models[options.taskType || 'standard']})`)
        
        // Record request for rate limiting
        recordRequest(preferredProvider.name)
        
        if (preferredProvider.name === 'huggingface') {
          return await callHuggingFace(preferredProvider, options)
        } else {
          return await callOpenAICompatible(preferredProvider, options)
        }
      } catch (error) {
        console.error(`[AI] ${preferredProvider.name} failed:`, error)
        // Continue to fallback
      }
    } else {
      console.warn(`[AI] ${preferredProvider.name} rate limited: ${rateCheck.reason}`)
      // Continue to fallback
    }
  }

  // Fallback: Try providers with available capacity
  let lastError: Error | null = null
  
  // Get provider with most capacity
  const providerNames = providers.map(p => p.name)
  const bestProvider = getProviderWithCapacity(providerNames)

  for (const provider of providers) {
    // Skip if we already tried this one
    if (provider.name === preferredProvider?.name) continue

    // Check rate limits
    const rateCheck = checkRateLimit(provider.name)
    if (!rateCheck.allowed) {
      console.warn(`[AI] ${provider.name} rate limited: ${rateCheck.reason}`)
      continue
    }

    try {
      console.log(`[AI] Fallback to ${provider.name} (${provider.models[options.taskType || 'standard']})`)
      
      // Record request
      recordRequest(provider.name)
      
      if (provider.name === 'huggingface') {
        return await callHuggingFace(provider, options)
      } else {
        return await callOpenAICompatible(provider, options)
      }
    } catch (error) {
      console.error(`[AI] ${provider.name} failed:`, error)
      lastError = error as Error
      // Continue to next provider
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`)
}

// Convenience function for simple text generation
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  taskType: 'fast' | 'standard' | 'advanced' = 'standard'
): Promise<string> {
  const messages: ChatMessage[] = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  messages.push({ role: 'user', content: prompt })

  const response = await chatCompletion({
    messages,
    taskType,
    temperature: 0.7,
  })

  return response.content
}

// Convenience function for JSON generation
export async function generateJSON(
  prompt: string,
  systemPrompt?: string,
  taskType: 'fast' | 'standard' | 'advanced' = 'standard'
): Promise<any> {
  const messages: ChatMessage[] = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  messages.push({ role: 'user', content: prompt })

  const response = await chatCompletion({
    messages,
    taskType,
    jsonMode: true,
    temperature: 0.7,
  })

  try {
    return JSON.parse(response.content)
  } catch (error) {
    // If JSON parsing fails, try to extract JSON from markdown code blocks
    const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    
    // Try to extract any JSON object from the response
    const objectMatch = response.content.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }

    throw new Error('Failed to parse JSON response from AI')
  }
}

// Streaming support (for future implementation)
export async function* chatCompletionStream(
  options: ChatCompletionOptions
): AsyncGenerator<string> {
  // This is a placeholder for streaming implementation
  // Would require SSE support from providers
  const response = await chatCompletion(options)
  yield response.content
}
