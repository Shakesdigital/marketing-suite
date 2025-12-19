// AI Provider Configuration with Free LLM Options
// Supports: Groq, OpenRouter, Hugging Face, and OpenAI (optional)

export type AIProvider = 'groq' | 'openrouter' | 'huggingface' | 'openai'

export interface AIProviderConfig {
  name: AIProvider
  apiKey: string
  baseURL: string
  models: {
    fast: string // For quick tasks (captions, summaries)
    standard: string // For standard tasks (emails, content)
    advanced: string // For complex tasks (blog posts, research)
  }
  enabled: boolean
  priority: number // Lower = higher priority
}

// Provider configurations
export const AI_PROVIDERS: Record<AIProvider, Omit<AIProviderConfig, 'apiKey' | 'enabled'>> = {
  groq: {
    name: 'groq',
    baseURL: 'https://api.groq.com/openai/v1',
    models: {
      fast: 'llama-3.1-8b-instant', // Lightning fast for quick generations
      standard: 'llama-3.1-70b-versatile', // Balanced performance
      advanced: 'llama-3.1-70b-versatile', // Best quality
    },
    priority: 1,
  },
  openrouter: {
    name: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    models: {
      fast: 'meta-llama/llama-3.1-8b-instruct:free',
      standard: 'meta-llama/llama-3.1-70b-instruct:free',
      advanced: 'meta-llama/llama-3.1-405b-instruct:free',
    },
    priority: 2,
  },
  huggingface: {
    name: 'huggingface',
    baseURL: 'https://api-inference.huggingface.co/models',
    models: {
      fast: 'meta-llama/Llama-3.2-3B-Instruct',
      standard: 'meta-llama/Llama-3.1-8B-Instruct',
      advanced: 'meta-llama/Llama-3.1-70B-Instruct',
    },
    priority: 3,
  },
  openai: {
    name: 'openai',
    baseURL: 'https://api.openai.com/v1',
    models: {
      fast: 'gpt-3.5-turbo',
      standard: 'gpt-4-turbo-preview',
      advanced: 'gpt-4-turbo-preview',
    },
    priority: 4,
  },
}

// Get enabled providers from environment
export function getEnabledProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = []

  // Groq (Free, very fast)
  if (process.env.GROQ_API_KEY) {
    providers.push({
      ...AI_PROVIDERS.groq,
      apiKey: process.env.GROQ_API_KEY,
      enabled: true,
    })
  }

  // OpenRouter (Free tier available)
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      ...AI_PROVIDERS.openrouter,
      apiKey: process.env.OPENROUTER_API_KEY,
      enabled: true,
    })
  }

  // Hugging Face (Free)
  if (process.env.HUGGINGFACE_API_KEY) {
    providers.push({
      ...AI_PROVIDERS.huggingface,
      apiKey: process.env.HUGGINGFACE_API_KEY,
      enabled: true,
    })
  }

  // OpenAI (Paid, optional fallback)
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      ...AI_PROVIDERS.openai,
      apiKey: process.env.OPENAI_API_KEY,
      enabled: true,
    })
  }

  // Sort by priority (lower = higher priority)
  return providers.sort((a, b) => a.priority - b.priority)
}

// Get primary provider (highest priority enabled provider)
export function getPrimaryProvider(): AIProviderConfig | null {
  const providers = getEnabledProviders()
  return providers[0] || null
}

// Get provider for specific task type
export function getProviderForTask(taskType: 'fast' | 'standard' | 'advanced'): AIProviderConfig | null {
  const providers = getEnabledProviders()

  // Strategy: Use Groq for fast, OpenRouter for standard, Groq for advanced (70B)
  if (taskType === 'fast') {
    return providers.find(p => p.name === 'groq') || providers[0] || null
  }

  if (taskType === 'standard') {
    return providers.find(p => p.name === 'openrouter') || providers.find(p => p.name === 'groq') || providers[0] || null
  }

  if (taskType === 'advanced') {
    return providers.find(p => p.name === 'groq') || providers.find(p => p.name === 'openrouter') || providers[0] || null
  }

  return providers[0] || null
}

// Check if any provider is configured
export function hasAnyProvider(): boolean {
  return getEnabledProviders().length > 0
}

// Get recommended setup message
export function getProviderSetupMessage(): string {
  const providers = getEnabledProviders()

  if (providers.length === 0) {
    return `No AI providers configured. Please add at least one API key to .env.local:

FREE OPTIONS (Recommended):
- GROQ_API_KEY (Get free at: https://console.groq.com)
- OPENROUTER_API_KEY (Get free at: https://openrouter.ai/keys)
- HUGGINGFACE_API_KEY (Get free at: https://huggingface.co/settings/tokens)

PAID OPTION (Optional):
- OPENAI_API_KEY (Get at: https://platform.openai.com/api-keys)

Groq is recommended for best performance and is completely free!`
  }

  return `Active AI Providers: ${providers.map(p => p.name).join(', ')}`
}
