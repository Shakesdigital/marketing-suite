// Quota Monitoring with Alerts and Graceful Degradation
import { AIProvider } from './providers'
import { getUsageStats, checkProviderHealth } from './rate-limiter'
import { getQueueStatus, setMaxConcurrent } from './request-queue'

export type AlertLevel = 'info' | 'warning' | 'critical'
export type AlertType = 
  | 'approaching_minute_limit'
  | 'approaching_daily_limit'
  | 'minute_limit_exceeded'
  | 'daily_limit_exceeded'
  | 'all_providers_limited'
  | 'queue_growing'
  | 'provider_failure'
  | 'high_usage_predicted'

export interface QuotaAlert {
  id: string
  timestamp: string
  level: AlertLevel
  type: AlertType
  provider?: AIProvider
  message: string
  currentUsage?: number
  limit?: number
  percentage?: number
  recommendation?: string
}

export interface QuotaThresholds {
  minuteWarning: number // Percentage (default: 70%)
  minuteCritical: number // Percentage (default: 90%)
  dailyWarning: number // Percentage (default: 80%)
  dailyCritical: number // Percentage (default: 95%)
  queueSizeWarning: number // Absolute number (default: 50)
  queueSizeCritical: number // Absolute number (default: 100)
}

export interface DegradationStrategy {
  name: string
  enabled: boolean
  trigger: {
    type: 'usage_percentage' | 'queue_size' | 'provider_failure'
    threshold: number
  }
  action: {
    type: 'reduce_concurrency' | 'enable_queue' | 'switch_provider' | 'throttle_requests' | 'cache_responses'
    params?: any
  }
}

class QuotaMonitor {
  private alerts: QuotaAlert[] = []
  private alertCallbacks: Array<(alert: QuotaAlert) => void> = []
  private thresholds: QuotaThresholds = {
    minuteWarning: 70,
    minuteCritical: 90,
    dailyWarning: 80,
    dailyCritical: 95,
    queueSizeWarning: 50,
    queueSizeCritical: 100,
  }
  private degradationStrategies: DegradationStrategy[] = [
    {
      name: 'Reduce Concurrency on High Usage',
      enabled: true,
      trigger: { type: 'usage_percentage', threshold: 85 },
      action: { type: 'reduce_concurrency', params: { targetConcurrency: 3 } },
    },
    {
      name: 'Switch Provider on Daily Limit',
      enabled: true,
      trigger: { type: 'usage_percentage', threshold: 95 },
      action: { type: 'switch_provider' },
    },
    {
      name: 'Throttle on Queue Growth',
      enabled: true,
      trigger: { type: 'queue_size', threshold: 75 },
      action: { type: 'throttle_requests', params: { delayMs: 1000 } },
    },
  ]
  private monitoringInterval: NodeJS.Timeout | null = null
  private lastCheck: { [key in AIProvider]?: { minute: number; daily: number } } = {}

  /**
   * Start monitoring with interval
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      console.warn('[QuotaMonitor] Already monitoring')
      return
    }

    console.log(`[QuotaMonitor] Starting monitoring (interval: ${intervalMs}ms)`)
    this.monitoringInterval = setInterval(() => {
      this.checkQuotas()
    }, intervalMs)

    // Initial check
    this.checkQuotas()
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      console.log('[QuotaMonitor] Stopped monitoring')
    }
  }

  /**
   * Check all quotas and generate alerts
   */
  checkQuotas(): void {
    const providers: AIProvider[] = ['groq', 'openrouter', 'huggingface', 'openai']
    const newAlerts: QuotaAlert[] = []

    // Check each provider
    for (const provider of providers) {
      const stats = getUsageStats(provider)
      
      // Check minute usage
      if (stats.minuteUsage.percentage >= this.thresholds.minuteCritical) {
        newAlerts.push({
          id: `${provider}_minute_critical_${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'critical',
          type: 'approaching_minute_limit',
          provider,
          message: `${provider}: Critical! ${stats.minuteUsage.percentage.toFixed(1)}% of minute limit used`,
          currentUsage: stats.minuteUsage.used,
          limit: stats.minuteUsage.limit,
          percentage: stats.minuteUsage.percentage,
          recommendation: 'Requests will be queued. Consider adding more providers.',
        })
      } else if (stats.minuteUsage.percentage >= this.thresholds.minuteWarning) {
        newAlerts.push({
          id: `${provider}_minute_warning_${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'warning',
          type: 'approaching_minute_limit',
          provider,
          message: `${provider}: ${stats.minuteUsage.percentage.toFixed(1)}% of minute limit used`,
          currentUsage: stats.minuteUsage.used,
          limit: stats.minuteUsage.limit,
          percentage: stats.minuteUsage.percentage,
          recommendation: 'Monitor usage. Requests may be throttled soon.',
        })
      }

      // Check daily usage
      if (stats.dailyUsage.percentage >= this.thresholds.dailyCritical) {
        newAlerts.push({
          id: `${provider}_daily_critical_${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'critical',
          type: 'approaching_daily_limit',
          provider,
          message: `${provider}: Critical! ${stats.dailyUsage.percentage.toFixed(1)}% of daily limit used`,
          currentUsage: stats.dailyUsage.used,
          limit: stats.dailyUsage.limit,
          percentage: stats.dailyUsage.percentage,
          recommendation: 'Daily limit almost reached. Add more providers or wait for reset.',
        })

        // Trigger degradation strategy
        this.executeDegradationStrategy('usage_percentage', stats.dailyUsage.percentage, provider)
      } else if (stats.dailyUsage.percentage >= this.thresholds.dailyWarning) {
        newAlerts.push({
          id: `${provider}_daily_warning_${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'warning',
          type: 'approaching_daily_limit',
          provider,
          message: `${provider}: ${stats.dailyUsage.percentage.toFixed(1)}% of daily limit used`,
          currentUsage: stats.dailyUsage.used,
          limit: stats.dailyUsage.limit,
          percentage: stats.dailyUsage.percentage,
          recommendation: 'Consider spreading requests or adding backup providers.',
        })
      }

      // Track usage changes for prediction
      this.lastCheck[provider] = {
        minute: stats.minuteUsage.used,
        daily: stats.dailyUsage.used,
      }
    }

    // Check queue size
    const queueStatus = getQueueStatus()
    if (queueStatus.queueSize >= this.thresholds.queueSizeCritical) {
      newAlerts.push({
        id: `queue_critical_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'critical',
        type: 'queue_growing',
        message: `Request queue is very large: ${queueStatus.queueSize} requests pending`,
        currentUsage: queueStatus.queueSize,
        limit: this.thresholds.queueSizeCritical,
        percentage: (queueStatus.queueSize / this.thresholds.queueSizeCritical) * 100,
        recommendation: 'System may be overloaded. Consider scaling or reducing request rate.',
      })

      this.executeDegradationStrategy('queue_size', queueStatus.queueSize)
    } else if (queueStatus.queueSize >= this.thresholds.queueSizeWarning) {
      newAlerts.push({
        id: `queue_warning_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'warning',
        type: 'queue_growing',
        message: `Request queue growing: ${queueStatus.queueSize} requests pending`,
        currentUsage: queueStatus.queueSize,
        recommendation: 'Monitor queue. May need to reduce request rate.',
      })
    }

    // Check overall health
    const health = checkProviderHealth()
    if (!health.healthy) {
      for (const warning of health.warnings) {
        newAlerts.push({
          id: `health_warning_${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'warning',
          type: 'provider_failure',
          message: warning,
          recommendation: 'Review provider status and consider alternatives.',
        })
      }
    }

    // Check if all providers are rate limited
    const allLimited = providers.every((provider) => {
      const stats = getUsageStats(provider)
      return stats.minuteUsage.percentage >= 100 || stats.dailyUsage.percentage >= 100
    })

    if (allLimited) {
      newAlerts.push({
        id: `all_limited_${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'critical',
        type: 'all_providers_limited',
        message: 'All AI providers are rate limited!',
        recommendation: 'All requests will be queued. System degraded until limits reset.',
      })
    }

    // Store and notify
    if (newAlerts.length > 0) {
      this.alerts.push(...newAlerts)
      
      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100)
      }

      // Notify callbacks
      newAlerts.forEach((alert) => {
        this.notifyAlert(alert)
      })
    }
  }

  /**
   * Execute degradation strategy
   */
  private executeDegradationStrategy(
    triggerType: 'usage_percentage' | 'queue_size' | 'provider_failure',
    value: number,
    provider?: AIProvider
  ): void {
    const strategies = this.degradationStrategies.filter(
      (s) => s.enabled && s.trigger.type === triggerType && value >= s.trigger.threshold
    )

    for (const strategy of strategies) {
      console.log(`[QuotaMonitor] Executing degradation strategy: ${strategy.name}`)

      switch (strategy.action.type) {
        case 'reduce_concurrency':
          const targetConcurrency = strategy.action.params?.targetConcurrency || 2
          setMaxConcurrent(targetConcurrency)
          console.log(`[QuotaMonitor] Reduced concurrency to ${targetConcurrency}`)
          break

        case 'throttle_requests':
          const delayMs = strategy.action.params?.delayMs || 1000
          console.log(`[QuotaMonitor] Throttling requests (delay: ${delayMs}ms)`)
          // Throttling is handled by the queue system
          break

        case 'switch_provider':
          console.log(`[QuotaMonitor] Provider switching will happen automatically`)
          // Provider switching is handled by the client
          break

        case 'cache_responses':
          console.log(`[QuotaMonitor] Response caching recommended`)
          // Would require cache implementation
          break
      }
    }
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: QuotaAlert) => void): void {
    this.alertCallbacks.push(callback)
  }

  /**
   * Notify all callbacks
   */
  private notifyAlert(alert: QuotaAlert): void {
    this.alertCallbacks.forEach((callback) => {
      try {
        callback(alert)
      } catch (error) {
        console.error('[QuotaMonitor] Error in alert callback:', error)
      }
    })
  }

  /**
   * Get recent alerts
   */
  getAlerts(
    level?: AlertLevel,
    provider?: AIProvider,
    limit: number = 50
  ): QuotaAlert[] {
    let filtered = this.alerts

    if (level) {
      filtered = filtered.filter((a) => a.level === level)
    }

    if (provider) {
      filtered = filtered.filter((a) => a.provider === provider)
    }

    return filtered.slice(-limit)
  }

  /**
   * Clear old alerts
   */
  clearAlerts(olderThan?: Date): void {
    if (olderThan) {
      this.alerts = this.alerts.filter(
        (a) => new Date(a.timestamp) > olderThan
      )
    } else {
      this.alerts = []
    }
  }

  /**
   * Get current status summary
   */
  getStatusSummary(): {
    status: 'healthy' | 'degraded' | 'critical'
    activeAlerts: { critical: number; warning: number; info: number }
    recommendations: string[]
  } {
    const recent = this.getAlerts(undefined, undefined, 20)
    const critical = recent.filter((a) => a.level === 'critical').length
    const warning = recent.filter((a) => a.level === 'warning').length
    const info = recent.filter((a) => a.level === 'info').length

    const status = critical > 0 ? 'critical' : warning > 0 ? 'degraded' : 'healthy'

    const recommendations = Array.from(
      new Set(recent.map((a) => a.recommendation).filter(Boolean) as string[])
    )

    return {
      status,
      activeAlerts: { critical, warning, info },
      recommendations,
    }
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: Partial<QuotaThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
    console.log('[QuotaMonitor] Updated thresholds:', this.thresholds)
  }

  /**
   * Get current thresholds
   */
  getThresholds(): QuotaThresholds {
    return { ...this.thresholds }
  }

  /**
   * Add degradation strategy
   */
  addDegradationStrategy(strategy: DegradationStrategy): void {
    this.degradationStrategies.push(strategy)
    console.log(`[QuotaMonitor] Added strategy: ${strategy.name}`)
  }

  /**
   * Enable/disable strategy
   */
  toggleStrategy(name: string, enabled: boolean): void {
    const strategy = this.degradationStrategies.find((s) => s.name === name)
    if (strategy) {
      strategy.enabled = enabled
      console.log(`[QuotaMonitor] Strategy "${name}" ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  /**
   * Get all strategies
   */
  getStrategies(): DegradationStrategy[] {
    return [...this.degradationStrategies]
  }

  /**
   * Predict if limits will be exceeded
   */
  predictUsage(hoursAhead: number = 1): {
    provider: AIProvider
    willExceedMinute: boolean
    willExceedDaily: boolean
    estimatedMinuteUsage: number
    estimatedDailyUsage: number
  }[] {
    const predictions: any[] = []
    const providers: AIProvider[] = ['groq', 'openrouter', 'huggingface', 'openai']

    for (const provider of providers) {
      const stats = getUsageStats(provider)
      const last = this.lastCheck[provider]

      if (!last) continue

      // Calculate rate of change
      const minuteRate = stats.minuteUsage.used - last.minute
      const dailyRate = stats.dailyUsage.used - last.daily

      // Predict future usage
      const minutesAhead = hoursAhead * 60
      const estimatedMinuteUsage = stats.minuteUsage.percentage + (minuteRate * minutesAhead)
      const estimatedDailyUsage = stats.dailyUsage.percentage + (dailyRate * hoursAhead)

      predictions.push({
        provider,
        willExceedMinute: estimatedMinuteUsage >= 100,
        willExceedDaily: estimatedDailyUsage >= 100,
        estimatedMinuteUsage: Math.min(estimatedMinuteUsage, 100),
        estimatedDailyUsage: Math.min(estimatedDailyUsage, 100),
      })
    }

    return predictions
  }
}

// Singleton instance
const quotaMonitor = new QuotaMonitor()

// Export functions
export function startQuotaMonitoring(intervalMs: number = 30000): void {
  quotaMonitor.startMonitoring(intervalMs)
}

export function stopQuotaMonitoring(): void {
  quotaMonitor.stopMonitoring()
}

export function onQuotaAlert(callback: (alert: QuotaAlert) => void): void {
  quotaMonitor.onAlert(callback)
}

export function getQuotaAlerts(
  level?: AlertLevel,
  provider?: AIProvider,
  limit: number = 50
): QuotaAlert[] {
  return quotaMonitor.getAlerts(level, provider, limit)
}

export function clearQuotaAlerts(olderThan?: Date): void {
  quotaMonitor.clearAlerts(olderThan)
}

export function getQuotaStatus() {
  return quotaMonitor.getStatusSummary()
}

export function setQuotaThresholds(thresholds: Partial<QuotaThresholds>): void {
  quotaMonitor.setThresholds(thresholds)
}

export function getQuotaThresholds(): QuotaThresholds {
  return quotaMonitor.getThresholds()
}

export function addDegradationStrategy(strategy: DegradationStrategy): void {
  quotaMonitor.addDegradationStrategy(strategy)
}

export function toggleDegradationStrategy(name: string, enabled: boolean): void {
  quotaMonitor.toggleStrategy(name, enabled)
}

export function getDegradationStrategies(): DegradationStrategy[] {
  return quotaMonitor.getStrategies()
}

export function predictQuotaUsage(hoursAhead: number = 1) {
  return quotaMonitor.predictUsage(hoursAhead)
}

export default quotaMonitor
