# Rate Limiting & Burst Handling Guide

## 🎯 Overview

The Shakes Digital Marketing Suite now includes **advanced rate limiting and burst handling** to maximize throughput while respecting provider limits.

---

## 📊 Updated Rate Limits (Accurate)

### **Groq (FREE)**
- **30 requests per minute (RPM)**
- **14,400 requests per day (RPD)**
- Perfect for high-volume burst traffic
- Automatic rate limit tracking

### **OpenRouter (FREE)**
- **~20 requests per minute** (conservative estimate)
- **~10,000 requests per day**
- Free Llama models included
- Good for standard workloads

### **Hugging Face (FREE)**
- **60 requests per minute** (1,000/hour ÷ 60)
- **24,000 requests per day** (1,000/hour × 24)
- Perfect for long-form content
- Generous limits

### **OpenAI (PAID)**
- **60+ requests per minute** (tier-dependent)
- **200,000+ requests per day**
- Premium quality
- Higher cost

---

## 🚀 New Features

### 1. **Intelligent Rate Limiting**

Automatic tracking of usage across all providers:

```typescript
import { checkRateLimit, recordRequest, getUsageStats } from '@/lib/ai/rate-limiter'

// Check if request is allowed
const check = checkRateLimit('groq')
if (check.allowed) {
  // Process request
  recordRequest('groq')
} else {
  console.log(`Rate limited: ${check.reason}`)
  console.log(`Retry after: ${check.retryAfter} seconds`)
}

// Get current usage
const stats = getUsageStats('groq')
console.log(`Minute: ${stats.minuteUsage.used}/${stats.minuteUsage.limit}`)
console.log(`Daily: ${stats.dailyUsage.used}/${stats.dailyUsage.limit}`)
```

### 2. **Request Queue System**

Handles bursts without hitting rate limits:

```typescript
import { queueAIRequest, batchAIRequests, bulkAIRequests } from '@/lib/ai/request-queue'

// Single high-priority request
const result = await queueAIRequest(options, 'high')

// Batch processing
const results = await batchAIRequests([
  { options: request1, priority: 'high' },
  { options: request2, priority: 'normal' },
  { options: request3, priority: 'low' },
])

// Bulk processing with progress
const results = await bulkAIRequests(
  requests,
  (completed, total) => {
    console.log(`Progress: ${completed}/${total}`)
  }
)
```

### 3. **Real-Time Monitoring Dashboard**

Navigate to `/dashboard/settings/ai-providers/monitoring` to see:

- ✅ Live usage statistics for all providers
- ✅ Minute and daily usage percentages
- ✅ Rate limit warnings and alerts
- ✅ Queue status and processing metrics
- ✅ Auto-refresh every 5 seconds
- ✅ Color-coded health indicators

### 4. **Automatic Provider Failover**

Smart routing based on capacity:

```typescript
// Automatically selects provider with most capacity
const result = await chatCompletion(options)

// System checks:
// 1. Preferred provider rate limits
// 2. Fallback to provider with capacity
// 3. Queue if all providers busy
// 4. Retry with exponential backoff
```

---

## 💡 Usage Patterns

### **Scenario 1: Single Request (Standard)**

```typescript
// Just use the client - automatic handling
import { generateText } from '@/lib/ai/client'

const result = await generateText('Write a blog post about AI')
// ✅ Automatically checks rate limits
// ✅ Falls back if needed
// ✅ Tracks usage
```

### **Scenario 2: Burst Traffic (100+ requests)**

```typescript
import { bulkAIRequests } from '@/lib/ai/request-queue'

// Generate 100 leads at once
const requests = Array(100).fill(null).map(() => ({
  messages: [{ role: 'user', content: 'Generate a lead' }],
  taskType: 'fast' as const,
}))

const results = await bulkAIRequests(requests, (done, total) => {
  console.log(`Processed ${done}/${total}`)
})

// ✅ Queues all requests
// ✅ Processes 5 concurrently
// ✅ Respects rate limits
// ✅ Automatic retry on failure
```

### **Scenario 3: Mixed Priority**

```typescript
import { queueAIRequest } from '@/lib/ai/request-queue'

// High priority: User-facing request
const userRequest = queueAIRequest(userOptions, 'high')

// Normal priority: Background task
const backgroundRequest = queueAIRequest(bgOptions, 'normal')

// Low priority: Batch processing
const batchRequest = queueAIRequest(batchOptions, 'low')

// High priority processed first!
```

### **Scenario 4: Monitoring & Alerts**

```typescript
import { checkProviderHealth, getAllUsageStats } from '@/lib/ai/rate-limiter'

// Check system health
const health = checkProviderHealth()
if (!health.healthy) {
  console.warn('Rate limit warnings:', health.warnings)
  // Send alert to team
}

// Get all stats
const stats = getAllUsageStats()
Object.entries(stats).forEach(([provider, usage]) => {
  if (usage.dailyUsage.percentage > 80) {
    console.warn(`${provider} at ${usage.dailyUsage.percentage}% daily limit`)
  }
})
```

---

## 📈 Performance Optimization

### **Burst Handling Strategy**

The system is optimized for **14,400 requests/day on Groq**:

| Time Window | Requests | Strategy |
|-------------|----------|----------|
| **1 minute** | 30 max | Immediate processing |
| **1 hour** | 1,800 max | Queue overflow |
| **1 day** | 14,400 max | Spread across day |

**Concurrency:** 5 simultaneous requests
**Queue:** Unlimited size with priority
**Retry:** Exponential backoff (1s, 2s, 4s, 8s...)

### **Recommended Patterns**

#### For Real-Time Features (Chat, Quick Gen):
```typescript
// Use 'fast' task type + high priority
const result = await queueAIRequest({
  messages: [...],
  taskType: 'fast'
}, 'high')
```

#### For Background Tasks (Bulk Lead Gen):
```typescript
// Use 'standard' task type + normal priority
const results = await bulkAIRequests(requests)
```

#### For Scheduled Jobs (Content Calendar):
```typescript
// Use 'advanced' task type + low priority
// Spread across off-peak hours
```

---

## 🎯 Best Practices

### 1. **Use Multiple Providers**

```bash
# .env.local
GROQ_API_KEY=gsk_...              # Primary (fast)
OPENROUTER_API_KEY=sk-or-v1-...   # Fallback (reliable)
HUGGINGFACE_API_KEY=hf_...        # Second fallback
```

**Benefits:**
- ✅ 14,400 + 10,000 + 24,000 = **48,400 requests/day** (free!)
- ✅ Automatic failover
- ✅ Load balancing

### 2. **Monitor Usage Regularly**

Visit `/dashboard/settings/ai-providers/monitoring`:
- Check daily usage trends
- Set up alerts at 80%
- Plan capacity for peak times

### 3. **Optimize Prompts**

```typescript
// ❌ Bad: Wasteful
const result = await generateText(
  'Tell me everything about AI in marketing in extreme detail...',
  'standard'
)

// ✅ Good: Efficient
const result = await generateText(
  'List 5 key AI marketing trends (50 words)',
  'fast'
)
```

### 4. **Batch Similar Requests**

```typescript
// ❌ Bad: 100 individual requests
for (const lead of leads) {
  await generateEmail(lead)  // 100 requests
}

// ✅ Good: Single batched request
const emailsPrompt = `Generate emails for these leads: ${JSON.stringify(leads)}`
const result = await generateJSON(emailsPrompt, systemPrompt, 'standard')
```

### 5. **Use Queue for Non-Critical Tasks**

```typescript
// Critical: Direct call
const result = await chatCompletion(options)

// Non-critical: Queue it
const result = await queueAIRequest(options, 'low')
```

---

## 🔧 Configuration

### Adjust Concurrency

```typescript
import { setMaxConcurrent } from '@/lib/ai/request-queue'

// Default: 5 concurrent requests
setMaxConcurrent(10)  // Increase for more throughput
setMaxConcurrent(3)   // Decrease to be more conservative
```

### Monitor Queue Status

```typescript
import { getQueueStatus } from '@/lib/ai/request-queue'

const status = getQueueStatus()
console.log(`Queue size: ${status.queueSize}`)
console.log(`Processing: ${status.concurrentRequests}`)
console.log(`High priority: ${status.highPriority}`)
```

### Reset Rate Limits (Testing)

```typescript
import { resetRateLimits } from '@/lib/ai/rate-limiter'

// Reset specific provider
resetRateLimits('groq')

// Reset all providers
resetRateLimits()
```

---

## 📊 Example: Handling 1000 Requests/Day

### Scenario: SaaS Marketing Agency

**Requirements:**
- 500 lead generations per day
- 300 email generations per day
- 200 blog post generations per day
- **Total: 1,000 requests/day**

**Setup:**

```bash
# Use Groq only (14,400/day limit)
GROQ_API_KEY=gsk_...
```

**Usage:**
- Lead gen (fast): ~0.5s each = 250s total
- Email gen (fast): ~0.5s each = 150s total
- Blog gen (advanced): ~2s each = 400s total
- **Total time: ~13 minutes of actual AI calls**

**With burst handling:**
- 5 concurrent requests
- 1,000 ÷ 5 = 200 batches
- 200 × 2s = **~7 minutes total**

**Rate limit usage:**
- 1,000 / 14,400 = **6.9% of daily limit**
- ✅ Plenty of headroom for growth!

---

## 🚨 Troubleshooting

### "Rate limit exceeded" Error

**Cause:** Hit minute or daily limit

**Solution:**
1. Check monitoring dashboard
2. Add more providers for failover
3. Use request queue for burst traffic
4. Spread requests over time

### Slow Processing

**Cause:** Queue backlog or rate limiting

**Solution:**
1. Increase concurrent requests: `setMaxConcurrent(10)`
2. Add more providers
3. Use 'fast' task type for quick operations
4. Optimize prompts to reduce response time

### Queue Growing Too Large

**Cause:** Requests faster than processing

**Solution:**
1. Increase concurrency
2. Add more providers
3. Use batch processing
4. Implement request throttling at source

---

## 📚 API Reference

### Rate Limiter Functions

```typescript
// Check if request allowed
checkRateLimit(provider: AIProvider): { allowed: boolean; reason?: string; retryAfter?: number }

// Record a request
recordRequest(provider: AIProvider): void

// Get usage statistics
getUsageStats(provider: AIProvider): { minuteUsage: UsageData; dailyUsage: UsageData }

// Get all providers' usage
getAllUsageStats(): Record<AIProvider, UsageStats>

// Check system health
checkProviderHealth(): { healthy: boolean; warnings: string[] }

// Get provider with most capacity
getProviderWithCapacity(providers: AIProvider[]): AIProvider | null

// Reset limits (testing only)
resetRateLimits(provider?: AIProvider): void
```

### Queue Functions

```typescript
// Queue single request
queueAIRequest(options: ChatCompletionOptions, priority?: 'high' | 'normal' | 'low'): Promise<Response>

// Batch requests
batchAIRequests(requests: Array<{ options: ChatCompletionOptions; priority?: string }>): Promise<Response[]>

// Bulk processing with progress
bulkAIRequests(requests: ChatCompletionOptions[], onProgress?: (done: number, total: number) => void): Promise<Response[]>

// Get queue status
getQueueStatus(): { queueSize: number; concurrentRequests: number; ... }

// Clear queue
clearQueue(): void

// Set max concurrent
setMaxConcurrent(max: number): void
```

---

## 🎯 Summary

### What You Get:

✅ **14,400 requests/day FREE** (Groq alone)
✅ **48,400+ requests/day** (all free providers)
✅ **Intelligent rate limiting** with automatic tracking
✅ **Request queue** for burst handling
✅ **Real-time monitoring** dashboard
✅ **Automatic failover** across providers
✅ **Priority queue** for urgent requests
✅ **Production-ready** performance

### Perfect For:

- 🚀 Startups with growth ambitions
- 💼 Agencies serving multiple clients
- 📈 High-volume marketing automation
- 🎯 Burst traffic scenarios
- 💰 Cost-conscious operations

---

**Go handle those bursts! 🔥**
