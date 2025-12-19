// Webhook Support for External Alert Systems
import { QuotaAlert } from './quota-monitor'

export interface WebhookConfig {
  id: string
  name: string
  url: string
  enabled: boolean
  alertLevels: ('info' | 'warning' | 'critical')[]
  headers?: Record<string, string>
  retryAttempts?: number
}

class WebhookManager {
  private webhooks: WebhookConfig[] = []
  private failedAttempts: Map<string, number> = new Map()

  /**
   * Add webhook
   */
  addWebhook(webhook: WebhookConfig): void {
    this.webhooks.push(webhook)
    console.log(`[Webhook] Added: ${webhook.name}`)
  }

  /**
   * Remove webhook
   */
  removeWebhook(id: string): void {
    this.webhooks = this.webhooks.filter((w) => w.id !== id)
    console.log(`[Webhook] Removed: ${id}`)
  }

  /**
   * Update webhook
   */
  updateWebhook(id: string, updates: Partial<WebhookConfig>): void {
    const webhook = this.webhooks.find((w) => w.id === id)
    if (webhook) {
      Object.assign(webhook, updates)
      console.log(`[Webhook] Updated: ${id}`)
    }
  }

  /**
   * Send alert to webhooks
   */
  async sendAlert(alert: QuotaAlert): Promise<void> {
    const eligibleWebhooks = this.webhooks.filter(
      (w) => w.enabled && w.alertLevels.includes(alert.level)
    )

    if (eligibleWebhooks.length === 0) return

    const promises = eligibleWebhooks.map((webhook) => this.sendToWebhook(webhook, alert))

    await Promise.allSettled(promises)
  }

  /**
   * Send to specific webhook
   */
  private async sendToWebhook(webhook: WebhookConfig, alert: QuotaAlert): Promise<void> {
    const maxRetries = webhook.retryAttempts || 3
    const currentAttempts = this.failedAttempts.get(webhook.id) || 0

    if (currentAttempts >= maxRetries) {
      console.error(`[Webhook] ${webhook.name} disabled after ${maxRetries} failures`)
      webhook.enabled = false
      return
    }

    try {
      const payload = {
        alert: {
          id: alert.id,
          timestamp: alert.timestamp,
          level: alert.level,
          type: alert.type,
          provider: alert.provider,
          message: alert.message,
          currentUsage: alert.currentUsage,
          limit: alert.limit,
          percentage: alert.percentage,
          recommendation: alert.recommendation,
        },
        source: 'shakes-marketing-suite',
        environment: process.env.NODE_ENV || 'development',
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Shakes-Marketing-Suite/1.0',
          ...webhook.headers,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Reset failed attempts on success
      this.failedAttempts.delete(webhook.id)
      console.log(`[Webhook] Sent to ${webhook.name}: ${alert.type}`)
    } catch (error: any) {
      const attempts = currentAttempts + 1
      this.failedAttempts.set(webhook.id, attempts)
      console.error(`[Webhook] Failed to send to ${webhook.name} (attempt ${attempts}/${maxRetries}):`, error.message)
    }
  }

  /**
   * Test webhook
   */
  async testWebhook(id: string): Promise<{ success: boolean; error?: string }> {
    const webhook = this.webhooks.find((w) => w.id === id)
    if (!webhook) {
      return { success: false, error: 'Webhook not found' }
    }

    const testAlert: QuotaAlert = {
      id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      type: 'approaching_daily_limit',
      message: 'This is a test alert',
      recommendation: 'This is a test',
    }

    try {
      await this.sendToWebhook(webhook, testAlert)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Get all webhooks
   */
  getWebhooks(): WebhookConfig[] {
    return [...this.webhooks]
  }

  /**
   * Get webhook stats
   */
  getWebhookStats(id: string): { failedAttempts: number; enabled: boolean } | null {
    const webhook = this.webhooks.find((w) => w.id === id)
    if (!webhook) return null

    return {
      failedAttempts: this.failedAttempts.get(id) || 0,
      enabled: webhook.enabled,
    }
  }
}

// Singleton instance
const webhookManager = new WebhookManager()

// Export functions
export function addWebhook(webhook: WebhookConfig): void {
  webhookManager.addWebhook(webhook)
}

export function removeWebhook(id: string): void {
  webhookManager.removeWebhook(id)
}

export function updateWebhook(id: string, updates: Partial<WebhookConfig>): void {
  webhookManager.updateWebhook(id, updates)
}

export function sendWebhookAlert(alert: QuotaAlert): Promise<void> {
  return webhookManager.sendAlert(alert)
}

export function testWebhook(id: string): Promise<{ success: boolean; error?: string }> {
  return webhookManager.testWebhook(id)
}

export function getWebhooks(): WebhookConfig[] {
  return webhookManager.getWebhooks()
}

export function getWebhookStats(id: string) {
  return webhookManager.getWebhookStats(id)
}

// Common webhook integrations

export const WEBHOOK_TEMPLATES = {
  slack: {
    name: 'Slack',
    headers: { 'Content-Type': 'application/json' },
    transform: (alert: QuotaAlert) => ({
      text: `${alert.level === 'critical' ? '🚨' : '⚠️'} *${alert.message}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${alert.level === 'critical' ? '🚨' : '⚠️'} *${alert.message}*`,
          },
        },
        alert.recommendation && {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `💡 _${alert.recommendation}_`,
          },
        },
        alert.percentage && {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Usage:*\n${alert.percentage.toFixed(1)}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Current:*\n${alert.currentUsage?.toLocaleString()}/${alert.limit?.toLocaleString()}`,
            },
          ],
        },
      ].filter(Boolean),
    }),
  },
  discord: {
    name: 'Discord',
    headers: { 'Content-Type': 'application/json' },
    transform: (alert: QuotaAlert) => ({
      embeds: [
        {
          title: `${alert.level === 'critical' ? '🚨' : '⚠️'} ${alert.type.replace(/_/g, ' ').toUpperCase()}`,
          description: alert.message,
          color: alert.level === 'critical' ? 0xff0000 : alert.level === 'warning' ? 0xffa500 : 0x0099ff,
          fields: [
            alert.provider && {
              name: 'Provider',
              value: alert.provider,
              inline: true,
            },
            alert.percentage && {
              name: 'Usage',
              value: `${alert.percentage.toFixed(1)}%`,
              inline: true,
            },
            alert.recommendation && {
              name: 'Recommendation',
              value: alert.recommendation,
            },
          ].filter(Boolean),
          timestamp: alert.timestamp,
        },
      ],
    }),
  },
  teams: {
    name: 'Microsoft Teams',
    headers: { 'Content-Type': 'application/json' },
    transform: (alert: QuotaAlert) => ({
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: alert.message,
      themeColor: alert.level === 'critical' ? 'FF0000' : alert.level === 'warning' ? 'FFA500' : '0099FF',
      title: `${alert.level === 'critical' ? '🚨' : '⚠️'} AI Provider Alert`,
      sections: [
        {
          activityTitle: alert.message,
          activitySubtitle: alert.type.replace(/_/g, ' '),
          facts: [
            alert.provider && {
              name: 'Provider',
              value: alert.provider,
            },
            alert.percentage && {
              name: 'Usage',
              value: `${alert.percentage.toFixed(1)}%`,
            },
            {
              name: 'Level',
              value: alert.level.toUpperCase(),
            },
          ].filter(Boolean),
        },
        alert.recommendation && {
          text: `💡 ${alert.recommendation}`,
        },
      ].filter(Boolean),
    }),
  },
}

export default webhookManager
