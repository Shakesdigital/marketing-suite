// Request Queue for High-Volume AI Requests with Burst Handling
import { ChatCompletionOptions, ChatCompletionResponse, chatCompletion } from './client'
import { checkRateLimit, recordRequest } from './rate-limiter'
import { getEnabledProviders } from './providers'

interface QueuedRequest {
  id: string
  options: ChatCompletionOptions
  resolve: (value: ChatCompletionResponse) => void
  reject: (error: Error) => void
  priority: 'high' | 'normal' | 'low'
  timestamp: number
  retries: number
  maxRetries: number
}

class AIRequestQueue {
  private queue: QueuedRequest[] = []
  private processing: boolean = false
  private concurrentRequests: number = 0
  private maxConcurrent: number = 5 // Process up to 5 requests concurrently
  private requestIdCounter: number = 0

  /**
   * Add request to queue
   */
  async enqueue(
    options: ChatCompletionOptions,
    priority: 'high' | 'normal' | 'low' = 'normal',
    maxRetries: number = 3
  ): Promise<ChatCompletionResponse> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `req_${++this.requestIdCounter}_${Date.now()}`,
        options,
        resolve,
        reject,
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries,
      }

      // Insert based on priority
      if (priority === 'high') {
        // High priority goes to front
        this.queue.unshift(request)
      } else if (priority === 'low') {
        // Low priority goes to back
        this.queue.push(request)
      } else {
        // Normal priority: find position after high priority items
        const highPriorityCount = this.queue.filter((r) => r.priority === 'high').length
        this.queue.splice(highPriorityCount, 0, request)
      }

      console.log(`[Queue] Added request ${request.id} (priority: ${priority}), queue size: ${this.queue.length}`)

      // Start processing if not already running
      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  /**
   * Process queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0 || this.concurrentRequests > 0) {
      // Process requests up to max concurrent limit
      while (this.queue.length > 0 && this.concurrentRequests < this.maxConcurrent) {
        const request = this.queue.shift()
        if (request) {
          this.concurrentRequests++
          this.processRequest(request).finally(() => {
            this.concurrentRequests--
          })
        }
      }

      // Wait a bit before checking again
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    this.processing = false
  }

  /**
   * Process a single request with retry logic
   */
  private async processRequest(request: QueuedRequest): Promise<void> {
    try {
      console.log(`[Queue] Processing ${request.id} (attempt ${request.retries + 1}/${request.maxRetries + 1})`)

      // Check if we can process (rate limits)
      const providers = getEnabledProviders()
      let canProcess = false

      for (const provider of providers) {
        const check = checkRateLimit(provider.name)
        if (check.allowed) {
          canProcess = true
          break
        }
      }

      if (!canProcess) {
        // All providers rate limited, wait and retry
        console.warn(`[Queue] All providers rate limited, waiting 10s...`)
        await new Promise((resolve) => setTimeout(resolve, 10000))

        if (request.retries < request.maxRetries) {
          request.retries++
          this.queue.unshift(request) // Re-queue at front
          return
        } else {
          throw new Error('All providers rate limited and max retries exceeded')
        }
      }

      // Process the request
      const response = await chatCompletion(request.options)
      request.resolve(response)
      console.log(`[Queue] Completed ${request.id}`)
    } catch (error) {
      console.error(`[Queue] Error processing ${request.id}:`, error)

      if (request.retries < request.maxRetries) {
        // Retry with exponential backoff
        request.retries++
        const backoffMs = Math.min(1000 * Math.pow(2, request.retries), 30000)
        console.log(`[Queue] Retrying ${request.id} after ${backoffMs}ms`)

        await new Promise((resolve) => setTimeout(resolve, backoffMs))
        this.queue.unshift(request) // Re-queue at front
      } else {
        request.reject(error as Error)
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queueSize: number
    concurrentRequests: number
    highPriority: number
    normalPriority: number
    lowPriority: number
  } {
    return {
      queueSize: this.queue.length,
      concurrentRequests: this.concurrentRequests,
      highPriority: this.queue.filter((r) => r.priority === 'high').length,
      normalPriority: this.queue.filter((r) => r.priority === 'normal').length,
      lowPriority: this.queue.filter((r) => r.priority === 'low').length,
    }
  }

  /**
   * Clear queue (for emergency or reset)
   */
  clear(): void {
    const rejectedCount = this.queue.length
    this.queue.forEach((req) => {
      req.reject(new Error('Queue cleared'))
    })
    this.queue = []
    console.log(`[Queue] Cleared ${rejectedCount} requests`)
  }

  /**
   * Set max concurrent requests
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, Math.min(max, 20))
    console.log(`[Queue] Max concurrent requests set to ${this.maxConcurrent}`)
  }
}

// Singleton instance
const requestQueue = new AIRequestQueue()

/**
 * Queue an AI request with priority
 */
export async function queueAIRequest(
  options: ChatCompletionOptions,
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<ChatCompletionResponse> {
  return requestQueue.enqueue(options, priority)
}

/**
 * Get queue status
 */
export function getQueueStatus() {
  return requestQueue.getStatus()
}

/**
 * Clear queue
 */
export function clearQueue() {
  requestQueue.clear()
}

/**
 * Set max concurrent requests
 */
export function setMaxConcurrent(max: number) {
  requestQueue.setMaxConcurrent(max)
}

/**
 * Batch process multiple requests efficiently
 */
export async function batchAIRequests(
  requests: Array<{ options: ChatCompletionOptions; priority?: 'high' | 'normal' | 'low' }>
): Promise<ChatCompletionResponse[]> {
  const promises = requests.map((req) => queueAIRequest(req.options, req.priority || 'normal'))

  return Promise.all(promises)
}

/**
 * Process requests with rate limit awareness
 * Useful for bulk operations like generating 100+ leads
 */
export async function bulkAIRequests(
  requests: ChatCompletionOptions[],
  onProgress?: (completed: number, total: number) => void
): Promise<ChatCompletionResponse[]> {
  const results: ChatCompletionResponse[] = []
  const total = requests.length

  console.log(`[Bulk] Processing ${total} requests...`)

  for (let i = 0; i < requests.length; i++) {
    try {
      const result = await queueAIRequest(requests[i], 'normal')
      results.push(result)

      if (onProgress) {
        onProgress(i + 1, total)
      }
    } catch (error) {
      console.error(`[Bulk] Failed request ${i + 1}/${total}:`, error)
      // Continue processing other requests
    }
  }

  console.log(`[Bulk] Completed ${results.length}/${total} requests`)
  return results
}

export default requestQueue
