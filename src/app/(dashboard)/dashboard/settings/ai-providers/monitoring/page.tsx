'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface UsageData {
  used: number
  limit: number
  percentage: number
}

interface ProviderUsage {
  minuteUsage: UsageData
  dailyUsage: UsageData
}

interface MonitoringData {
  providers: Record<string, ProviderUsage>
  health: {
    healthy: boolean
    warnings: string[]
  }
  queue: {
    queueSize: number
    concurrentRequests: number
    highPriority: number
    normalPriority: number
    lowPriority: number
  }
  enabled: Array<{
    name: string
    priority: number
    model: string
  }>
  timestamp: string
}

export default function AIMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  async function fetchData() {
    try {
      const response = await fetch('/api/ai/usage')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  function getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'text-red-600 bg-red-100'
    if (percentage >= 70) return 'text-orange-600 bg-orange-100'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  function getUsageBorderColor(percentage: number): string {
    if (percentage >= 90) return 'border-red-300'
    if (percentage >= 70) return 'border-orange-300'
    if (percentage >= 50) return 'border-yellow-300'
    return 'border-green-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading monitoring data...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">No data available</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Provider Monitoring</h1>
          <p className="text-gray-600">
            Real-time usage statistics and rate limit monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <Card className={`p-6 mb-6 ${
        data.health.healthy 
          ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' 
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
      }`}>
        <div className="flex items-start gap-4">
          {data.health.healthy ? (
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold mb-2">
              System Health: {data.health.healthy ? 'All Systems Operational' : 'Warnings Detected'}
            </h3>
            {data.health.warnings.length > 0 && (
              <div className="space-y-1">
                {data.health.warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-red-700">⚠️ {warning}</p>
                ))}
              </div>
            )}
            {data.health.healthy && (
              <p className="text-sm text-green-700">All AI providers are operating within normal limits</p>
            )}
          </div>
        </div>
      </Card>

      {/* Queue Status */}
      {data.queue.queueSize > 0 && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Request Queue Status</h3>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600">Queue Size</p>
              <p className="text-2xl font-bold">{data.queue.queueSize}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold">{data.queue.concurrentRequests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{data.queue.highPriority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Normal Priority</p>
              <p className="text-2xl font-bold text-blue-600">{data.queue.normalPriority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Priority</p>
              <p className="text-2xl font-bold text-gray-600">{data.queue.lowPriority}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Provider Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(data.providers).map(([providerName, usage]) => {
          const isEnabled = data.enabled.some(p => p.name === providerName)
          if (!isEnabled) return null

          const provider = data.enabled.find(p => p.name === providerName)

          return (
            <Card key={providerName} className={`p-6 border-2 ${getUsageBorderColor(Math.max(usage.minuteUsage.percentage, usage.dailyUsage.percentage))}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold capitalize">{providerName}</h3>
                  <p className="text-sm text-gray-600">{provider?.model}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Priority: {provider?.priority}</span>
                </div>
              </div>

              {/* Minute Usage */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Per Minute (RPM)</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${getUsageColor(usage.minuteUsage.percentage)}`}>
                    {usage.minuteUsage.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      usage.minuteUsage.percentage >= 90 ? 'bg-red-600' :
                      usage.minuteUsage.percentage >= 70 ? 'bg-orange-600' :
                      usage.minuteUsage.percentage >= 50 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(usage.minuteUsage.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {usage.minuteUsage.used} / {usage.minuteUsage.limit} requests
                </p>
              </div>

              {/* Daily Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Per Day (RPD)</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${getUsageColor(usage.dailyUsage.percentage)}`}>
                    {usage.dailyUsage.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      usage.dailyUsage.percentage >= 90 ? 'bg-red-600' :
                      usage.dailyUsage.percentage >= 70 ? 'bg-orange-600' :
                      usage.dailyUsage.percentage >= 50 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(usage.dailyUsage.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {usage.dailyUsage.used.toLocaleString()} / {usage.dailyUsage.limit.toLocaleString()} requests
                </p>
              </div>

              {/* Warning if approaching limits */}
              {(usage.minuteUsage.percentage >= 80 || usage.dailyUsage.percentage >= 80) && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-xs text-orange-700 font-medium">
                      Approaching rate limit - requests may be throttled
                    </span>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Enabled Providers Summary */}
      <Card className="p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Active Providers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.enabled.map((provider) => (
            <div key={provider.name} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold capitalize">{provider.name}</h4>
                <Zap className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600">{provider.model}</p>
              <p className="text-xs text-gray-500 mt-1">Priority: {provider.priority}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Last Updated */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  )
}
