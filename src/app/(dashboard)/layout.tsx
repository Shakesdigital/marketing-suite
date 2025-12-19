'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { CopilotKit } from '@copilotkit/react-core'
import { CopilotSidebar } from '@copilotkit/react-ui'
import '@copilotkit/react-ui/styles.css'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <div className="flex min-h-screen bg-gray-50">
        <DashboardNav />
        <CopilotSidebar
          defaultOpen={false}
          labels={{
            title: "Marketing Assistant",
            initial: "Hi! I'm your AI marketing assistant. I can help you with onboarding, market research, creating marketing plans, and generating content. What would you like to do today?",
          }}
        >
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </CopilotSidebar>
      </div>
    </CopilotKit>
  )
}
