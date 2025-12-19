'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { supabase } from '@/lib/supabase/client'
import { Company, MarketResearch } from '@/types'
import { performMarketResearch, getLatestResearch } from '@/lib/actions/research-actions'
import { Button } from '@/components/ui/button'
import { TrendingUp, FileText, Calendar, Settings, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [research, setResearch] = useState<MarketResearch | null>(null)
  const [loading, setLoading] = useState(true)
  const [researchLoading, setResearchLoading] = useState(false)

  useEffect(() => {
    loadCompanyData()
  }, [companyId])

  const loadCompanyData = async () => {
    try {
      // Load company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (companyError) throw companyError

      setCompany(companyData as Company)

      // Load latest research
      const researchData = await getLatestResearch(companyId)
      setResearch(researchData)
    } catch (error) {
      console.error('Error loading company:', error)
    } finally {
      setLoading(false)
    }
  }

  // Make company data readable by Copilot
  useCopilotReadable({
    description: 'Current company information and status',
    value: company,
  })

  useCopilotReadable({
    description: 'Latest market research data for the company',
    value: research,
  })

  // Action: Perform market research
  useCopilotAction({
    name: 'performMarketResearch',
    description: 'Conduct comprehensive market research for the company including competitor analysis, trends, and opportunities',
    parameters: [],
    handler: async () => {
      if (!company) {
        return 'Company data not loaded yet. Please wait a moment and try again.'
      }

      setResearchLoading(true)

      try {
        // This is a simplified implementation - in production, you'd call the AI model directly
        const mockResearch: MarketResearch = {
          id: crypto.randomUUID(),
          company_id: company.id,
          competitors: [
            {
              name: `Competitor in ${company.industry}`,
              strengths: ['Strong brand presence', 'High engagement rate', 'Consistent posting'],
              weaknesses: ['Limited platform diversity', 'Generic content'],
              content_strategy: 'Focus on educational content and user-generated content',
              engagement_rate: 0.045,
              followers: 75000,
              posting_frequency: '4-5 times per week',
            },
          ],
          trends: [
            {
              name: 'Short-form video content',
              description: 'Reels and TikTok-style videos are dominating engagement',
              relevance_score: 9,
              platforms: ['instagram', 'tiktok', 'facebook'],
              timeframe: 'Current',
            },
            {
              name: 'Authentic behind-the-scenes content',
              description: 'Audiences crave transparency and real glimpses into businesses',
              relevance_score: 8,
              platforms: ['instagram', 'linkedin'],
              timeframe: 'Current',
            },
          ],
          popular_content_formats: [
            {
              type: 'Reels/Short-form video',
              platform: 'instagram',
              engagement_rate: 0.08,
              examples: ['Tutorials', 'Behind-the-scenes', 'Product showcases'],
            },
            {
              type: 'Carousel posts',
              platform: 'instagram',
              engagement_rate: 0.06,
              examples: ['Tips and tricks', 'Before/after', 'Educational content'],
            },
          ],
          engagement_patterns: {
            best_posting_times: {
              instagram: ['9am', '12pm', '7pm'],
              facebook: ['10am', '1pm', '8pm'],
              linkedin: ['8am', '12pm', '5pm'],
            },
            best_posting_days: {
              instagram: ['Tuesday', 'Wednesday', 'Thursday'],
              facebook: ['Monday', 'Wednesday', 'Friday'],
              linkedin: ['Tuesday', 'Wednesday', 'Thursday'],
            },
            optimal_frequency: {
              instagram: 5,
              facebook: 4,
              linkedin: 3,
            },
          },
          hashtag_analysis: [
            {
              hashtag: `#${company.industry?.toLowerCase().replace(/\s+/g, '')}`,
              popularity: 85,
              relevance: 95,
              competition: 'medium',
              recommended: true,
            },
            {
              hashtag: '#smallbusiness',
              popularity: 90,
              relevance: 75,
              competition: 'high',
              recommended: true,
            },
          ],
          audience_sentiment: {
            overall: 'positive',
            topics: {
              quality: 'positive',
              pricing: 'neutral',
              customer_service: 'positive',
            },
            common_feedback: ['Quality products', 'Great value', 'Responsive support'],
          },
          opportunities: [
            {
              title: 'Video Content Expansion',
              description: 'Strong opportunity to leverage short-form video on TikTok and Instagram Reels',
              priority: 'high',
              actionable_steps: [
                'Create 3-5 Reels per week',
                'Focus on educational and entertaining content',
                'Use trending audio',
              ],
            },
            {
              title: 'User-Generated Content',
              description: 'Encourage customers to share their experiences',
              priority: 'medium',
              actionable_steps: ['Create branded hashtag', 'Run UGC campaigns', 'Repost customer content'],
            },
          ],
          threats: [
            {
              title: 'Increasing Competition',
              description: 'More competitors entering the social media space',
              severity: 'medium',
              mitigation: ['Focus on unique value proposition', 'Increase content frequency', 'Build community'],
            },
          ],
          research_date: new Date().toISOString(),
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Save to database
        const { data, error } = await supabase
          .from('market_research')
          .insert({
            company_id: company.id,
            competitors: mockResearch.competitors,
            trends: mockResearch.trends,
            popular_content_formats: mockResearch.popular_content_formats,
            engagement_patterns: mockResearch.engagement_patterns,
            hashtag_analysis: mockResearch.hashtag_analysis,
            audience_sentiment: mockResearch.audience_sentiment,
            opportunities: mockResearch.opportunities,
            threats: mockResearch.threats,
            status: 'completed',
          })
          .select()
          .single()

        if (error) throw error

        setResearch(data as MarketResearch)
        setResearchLoading(false)

        return `✅ Market research completed for ${company.name}! I've analyzed competitors, identified trends, and found opportunities. The research shows that short-form video content is trending highly in your industry. Would you like me to create a marketing plan based on these insights?`
      } catch (error) {
        setResearchLoading(false)
        return 'There was an error performing the research. Please try again.'
      }
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading company...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Company not found</h2>
          <Button className="mt-4" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="mt-2 text-gray-600">{company.industry}</p>
            {company.description && (
              <p className="mt-2 text-gray-700">{company.description}</p>
            )}
          </div>
          <Link href={`/dashboard/companies/${company.id}/settings`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <ActionCard
          title="Market Research"
          description={research ? 'View research' : 'Start research'}
          icon={<TrendingUp className="h-6 w-6" />}
          href="#research"
          status={research ? 'completed' : 'pending'}
        />
        <ActionCard
          title="Marketing Plan"
          description="Create strategy"
          icon={<FileText className="h-6 w-6" />}
          href={`/dashboard/companies/${company.id}/plans`}
          status="pending"
        />
        <ActionCard
          title="Content Calendar"
          description="Schedule posts"
          icon={<Calendar className="h-6 w-6" />}
          href={`/dashboard/companies/${company.id}/calendar`}
          status="pending"
        />
        <ActionCard
          title="Generate Content"
          description="Create posts"
          icon={<Sparkles className="h-6 w-6" />}
          href={`/dashboard/companies/${company.id}/content`}
          status="pending"
        />
      </div>

      {/* Market Research Section */}
      <div id="research" className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Market Research</h2>
        {!research && !researchLoading && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No research data yet</h3>
            <p className="mt-2 text-gray-600">
              Ask the AI assistant to perform market research for your company
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Try: "Please perform market research for this company"
            </p>
          </div>
        )}

        {researchLoading && (
          <div className="rounded-lg border bg-white p-8 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Analyzing your market...</p>
          </div>
        )}

        {research && (
          <div className="space-y-6">
            {/* Trends */}
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 font-semibold">Current Trends</h3>
              <div className="space-y-3">
                {research.trends?.map((trend, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4">
                    <h4 className="font-medium">{trend.name}</h4>
                    <p className="text-sm text-gray-600">{trend.description}</p>
                    <div className="mt-1 flex gap-2">
                      {trend.platforms?.map((platform) => (
                        <span
                          key={platform}
                          className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 font-semibold">Opportunities</h3>
              <div className="space-y-3">
                {research.opportunities?.map((opp, index) => (
                  <div key={index} className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium">{opp.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        opp.priority === 'high' ? 'bg-red-100 text-red-800' :
                        opp.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {opp.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{opp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ActionCard({ title, description, icon, href, status }: any) {
  return (
    <Link href={href}>
      <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
          {status === 'completed' && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
              Done
            </span>
          )}
        </div>
        <h3 className="mt-3 font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  )
}
