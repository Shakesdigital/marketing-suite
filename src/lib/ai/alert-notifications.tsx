// Alert Notification System with Toast UI
'use client'

import { useEffect, useState } from 'react'
import { QuotaAlert, onQuotaAlert, getQuotaAlerts, getQuotaStatus } from './quota-monitor'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  getToastIcon,
} from '@/components/ui/toast'

export function useQuotaAlerts() {
  const [alerts, setAlerts] = useState<QuotaAlert[]>([])
  const [toasts, setToasts] = useState<QuotaAlert[]>([])

  useEffect(() => {
    // Load existing alerts
    setAlerts(getQuotaAlerts())

    // Listen for new alerts
    onQuotaAlert((alert) => {
      setAlerts((prev) => [...prev, alert])
      setToasts((prev) => [...prev, alert])

      // Auto-dismiss toast after 5 seconds (warning) or 10 seconds (critical)
      const duration = alert.level === 'critical' ? 10000 : 5000
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== alert.id))
      }, duration)
    })
  }, [])

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { alerts, toasts, dismissToast }
}

export function QuotaAlertToasts() {
  const { toasts, dismissToast } = useQuotaAlerts()

  return (
    <ToastProvider>
      {toasts.map((alert) => {
        const variant =
          alert.level === 'critical' ? 'error' : alert.level === 'warning' ? 'warning' : 'info'

        return (
          <Toast key={alert.id} variant={variant} duration={alert.level === 'critical' ? 10000 : 5000}>
            <div className="flex items-start gap-3">
              {getToastIcon(variant)}
              <div className="flex-1">
                <ToastTitle>
                  {alert.level === 'critical' ? '🚨 Critical Alert' : '⚠️ Warning'}
                </ToastTitle>
                <ToastDescription className="mt-1">{alert.message}</ToastDescription>
                {alert.recommendation && (
                  <ToastDescription className="mt-2 text-xs opacity-75">
                    💡 {alert.recommendation}
                  </ToastDescription>
                )}
                {alert.percentage && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          alert.percentage >= 90
                            ? 'bg-red-600'
                            : alert.percentage >= 70
                            ? 'bg-orange-600'
                            : 'bg-yellow-600'
                        }`}
                        style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs mt-1 opacity-75">
                      {alert.currentUsage?.toLocaleString()} / {alert.limit?.toLocaleString()} (
                      {alert.percentage.toFixed(1)}%)
                    </p>
                  </div>
                )}
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

// Status banner component
export function QuotaStatusBanner() {
  const [status, setStatus] = useState<ReturnType<typeof getQuotaStatus> | null>(null)

  useEffect(() => {
    // Update status every 30 seconds
    const updateStatus = () => setStatus(getQuotaStatus())
    updateStatus()
    const interval = setInterval(updateStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!status || status.status === 'healthy') return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 p-3 ${
        status.status === 'critical'
          ? 'bg-red-600 text-white'
          : 'bg-orange-500 text-white'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold">
            {status.status === 'critical' ? '🚨 System Degraded' : '⚠️ High Usage'}
          </span>
          <span className="text-sm opacity-90">
            {status.activeAlerts.critical} critical, {status.activeAlerts.warning} warnings
          </span>
        </div>
        <button
          onClick={() => (window.location.href = '/dashboard/settings/ai-providers/monitoring')}
          className="text-sm underline hover:no-underline"
        >
          View Details →
        </button>
      </div>
    </div>
  )
}
