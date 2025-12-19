'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { MarketResearch } from '@/types'
import { TrendingUp } from 'lucide-react'

export default function ResearchPage() {
  const [research, setResearch] = useState<MarketResearch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadResearch()
  }, [])

  const loadResearch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Get user's companies
        const { data: companies } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)

        if (companies) {
          const companyIds = companies.map((c) => c.id)

          // Get research for all companies
          const { data } = await supabase
            .from('market_research')
            .select('*, companies(name)')
            .in('company_id', companyIds)
            .order('created_at', { ascending: false })

          setResearch(data as any || [])
        }
      }
    } catch (error) {
      console.error('Error loading research:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading research...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Market Research</h1>
        <p className="mt-2 text-gray-600">View all market research across your companies</p>
      </div>

      {research.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No research data yet</h3>
          <p className="mt-2 text-gray-600">
            Research will appear here after you perform market analysis for your companies
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {research.map((item: any) => (
            <div key={item.id} className="rounded-lg border bg-white p-6">
              <h3 className="text-xl font-semibold">{item.companies?.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium">Competitors</h4>
                  <p className="text-2xl font-bold">{item.competitors?.length || 0}</p>
                </div>
                <div>
                  <h4 className="font-medium">Trends</h4>
                  <p className="text-2xl font-bold">{item.trends?.length || 0}</p>
                </div>
                <div>
                  <h4 className="font-medium">Opportunities</h4>
                  <p className="text-2xl font-bold">{item.opportunities?.length || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
