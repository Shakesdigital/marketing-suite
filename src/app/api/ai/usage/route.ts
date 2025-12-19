// API endpoint for AI usage monitoring
import { NextRequest, NextResponse } from 'next/server'
import { getAllUsageStats, checkProviderHealth } from '@/lib/ai/rate-limiter'
import { getQueueStatus } from '@/lib/ai/request-queue'
import { getEnabledProviders } from '@/lib/ai/providers'

export async function GET(req: NextRequest) {
  try {
    // Get all usage statistics
    const usageStats = getAllUsageStats()
    const providerHealth = checkProviderHealth()
    const queueStatus = getQueueStatus()
    const enabledProviders = getEnabledProviders()

    return NextResponse.json({
      success: true,
      data: {
        providers: usageStats,
        health: providerHealth,
        queue: queueStatus,
        enabled: enabledProviders.map(p => ({
          name: p.name,
          priority: p.priority,
          model: p.models.standard,
        })),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
