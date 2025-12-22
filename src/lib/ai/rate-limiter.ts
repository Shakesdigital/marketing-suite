// Rate Limiting and Burst Handling for AI Providers
import { AIProvider } from './providers'

interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerDay: number
  burstSize?: number // Allow burst up to this size
}

interface RateLimitState {
  minuteRequests: { timestamp: number; count: number }
  dailyRequests: { timestamp: number; count: number }
}

// Rate limit configurations for each provider
const RATE_LIMITS: Record<AIProvider, RateLimitConfig> = {
  groq: {
    requestsPerMinute: 30,
    requestsPerDay: 14400, // Accurate limit for Groq
    burstSize: 30, // Allow burst up to RPM limit
  },
  openrouter: {
    requestsPerMinute: 20, // Conservative estimate
    requestsPerDay: 10000, // Depends on free credits
    burstSize: 20,
  },
  huggingface: {
    requestsPerMinute: 60, // Based on 1000/hour
    requestsPerDay: 24000, // 1000 per hour * 24
    burstSize: 60,
  },
  openai: {
    requestsPerMinute: 60, // Paid tier, higher limits
    requestsPerDay: 200000, // Effectively unlimited for paid
    burstSize: 100,
  },
  local: {
    requestsPerMinute: 1000, // No external rate limits for local
    requestsPerDay: 100000, // Effectively unlimited
    burstSize: 1000,
  },
}

// In-memory rate limit tracking (use Redis in production)
const rateLimitState: Map<AIProvider, RateLimitState> = new Map()

/**
 * Initialize rate limit state for a provider
 */
function initRateLimitState(provider: AIProvider): RateLimitState {
  const now = Date.now()
  return {
    minuteRequests: { timestamp: now, count: 0 },
    dailyRequests: { timestamp: now, count: 0 },
  }
}

/**
 * Get or create rate limit state for provider
 */
function getRateLimitState(provider: AIProvider): RateLimitState {
  let state = rateLimitState.get(provider)
  if (!state) {
    state = initRateLimitState(provider)
    rateLimitState.set(provider, state)
  }
  return state
}

/**
 * Check if request is within rate limits
 */
export function checkRateLimit(provider: AIProvider): {
  allowed: boolean
  reason?: string
  retryAfter?: number
} {
  const config = RATE_LIMITS[provider]
  const state = getRateLimitState(provider)
  const now = Date.now()

  // Check minute limit
  const minuteAge = now - state.minuteRequests.timestamp
  if (minuteAge >= 60000) {
    // Reset minute counter
    state.minuteRequests = { timestamp: now, count: 0 }
  }

  if (state.minuteRequests.count >= config.requestsPerMinute) {
    const retryAfter = 60000 - minuteAge
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${config.requestsPerMinute} requests per minute`,
      retryAfter: Math.ceil(retryAfter / 1000),
    }
  }

  // Check daily limit
  const dailyAge = now - state.dailyRequests.timestamp
  if (dailyAge >= 86400000) {
    // Reset daily counter (24 hours)
    state.dailyRequests = { timestamp: now, count: 0 }
  }

  if (state.dailyRequests.count >= config.requestsPerDay) {
    const retryAfter = 86400000 - dailyAge
    return {
      allowed: false,
      reason: `Daily limit exceeded: ${config.requestsPerDay} requests per day`,
      retryAfter: Math.ceil(retryAfter / 1000),
    }
  }

  return { allowed: true }
}

/**
 * Record a request for rate limiting
 */
export function recordRequest(provider: AIProvider): void {
  const state = getRateLimitState(provider)
  state.minuteRequests.count++
  state.dailyRequests.count++
}

/**
 * Get current usage stats for a provider
 */
export function getUsageStats(provider: AIProvider): {
  minuteUsage: { used: number; limit: number; percentage: number }
  dailyUsage: { used: number; limit: number; percentage: number }
} {
  const config = RATE_LIMITS[provider]
  const state = getRateLimitState(provider)
  const now = Date.now()

  // Clean up stale counters
  if (now - state.minuteRequests.timestamp >= 60000) {
    state.minuteRequests = { timestamp: now, count: 0 }
  }
  if (now - state.dailyRequests.timestamp >= 86400000) {
    state.dailyRequests = { timestamp: now, count: 0 }
  }

  return {
    minuteUsage: {
      used: state.minuteRequests.count,
      limit: config.requestsPerMinute,
      percentage: (state.minuteRequests.count / config.requestsPerMinute) * 100,
    },
    dailyUsage: {
      used: state.dailyRequests.count,
      limit: config.requestsPerDay,
      percentage: (state.dailyRequests.count / config.requestsPerDay) * 100,
    },
  }
}

/**
 * Get provider with most capacity available
 */
export function getProviderWithCapacity(providers: AIProvider[]): AIProvider | null {
  let bestProvider: AIProvider | null = null
  let lowestUsage = Infinity

  for (const provider of providers) {
    const check = checkRateLimit(provider)
    if (check.allowed) {
      const stats = getUsageStats(provider)
      const totalUsage = (stats.minuteUsage.percentage + stats.dailyUsage.percentage) / 2

      if (totalUsage < lowestUsage) {
        lowestUsage = totalUsage
        bestProvider = provider
      }
    }
  }

  return bestProvider
}

/**
 * Reset rate limits (for testing or manual reset)
 */
export function resetRateLimits(provider?: AIProvider): void {
  if (provider) {
    rateLimitState.delete(provider)
  } else {
    rateLimitState.clear()
  }
}

/**
 * Get all providers' current usage
 */
export function getAllUsageStats(): Record<AIProvider, ReturnType<typeof getUsageStats>> {
  const providers: AIProvider[] = ['groq', 'openrouter', 'huggingface', 'openai', 'local']
  const stats: any = {}

  for (const provider of providers) {
    stats[provider] = getUsageStats(provider)
  }

  return stats
}

/**
 * Check if any provider is approaching limits
 */
export function checkProviderHealth(): {
  healthy: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  const providers: AIProvider[] = ['groq', 'openrouter', 'huggingface', 'openai', 'local']

  for (const provider of providers) {
    const stats = getUsageStats(provider)

    if (stats.minuteUsage.percentage > 90) {
      warnings.push(`${provider}: Minute limit at ${stats.minuteUsage.percentage.toFixed(1)}%`)
    }

    if (stats.dailyUsage.percentage > 80) {
      warnings.push(`${provider}: Daily limit at ${stats.dailyUsage.percentage.toFixed(1)}%`)
    }
  }

  return {
    healthy: warnings.length === 0,
    warnings,
  }
}
