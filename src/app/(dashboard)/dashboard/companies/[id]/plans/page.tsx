'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { supabase } from '@/lib/supabase/client'
import { Company, MarketResearch, MarketingPlan } from '@/types'
import { generateMarketingPlan, approveMarketingPlan, getCompanyPlans } from '@/lib/actions/marketing-plan-actions'
import { getLatestResearch } from '@/lib/actions/research-actions'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, Target, TrendingUp, Calendar, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function MarketingPlansPage() {
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [research, setResearch] = useState<MarketResearch | null>(null)
  const [plans, setPlans] = useState<MarketingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [companyId])

  const loadData = async () => {
    try {
      // Load company
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      setCompany(companyData as Company)

      // Load research
      const researchData = await getLatestResearch(companyId)
      setResearch(researchData)

      // Load plans
      const plansData = await getCompanyPlans(companyId)
      setPlans(plansData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Make data readable by Copilot
  useCopilotReadable({
    description: 'Company information for marketing plan generation',
    value: company,
  })

  useCopilotReadable({
    description: 'Market research data for plan generation',
    value: research,
  })

  useCopilotReadable({
    description: 'Existing marketing plans',
    value: plans,
  })

  // Action: Generate marketing plan
  useCopilotAction({
    name: 'generateMarketingPlan',
    description: 'Generate a comprehensive marketing plan based on company profile and market research',
    parameters: [],
    handler: async () => {
      if (!company) {
        return 'Company data not available. Please ensure the company is properly set up.'
      }

      if (!research) {
        return 'Please perform market research first before generating a marketing plan. Ask me to "perform market research".'
      }

      setGenerating(true)

      try {
        const plan = await generateMarketingPlan(company, research)

        if (plan) {
          setPlans([plan, ...plans])
          setGenerating(false)
          return `✅ Marketing plan generated successfully for ${company.name}! 

The plan includes:
- ${plan.goals?.length || 0} SMART goals
- ${plan.content_pillars?.length || 0} content pillars
- ${plan.campaigns?.length || 0} campaign ideas
- Daily, weekly, monthly, and yearly strategies
- ${plan.kpis?.length || 0} key performance indicators

Review the plan below and let me know if you'd like to make any adjustments. When you're ready, you can approve it to start generating content!`
        } else {
          setGenerating(false)
          return 'Failed to generate marketing plan. Please try again.'
        }
      } catch (error) {
        setGenerating(false)
        return 'An error occurred while generating the plan. Please try again.'
      }
    },
  })

  // Action: Approve marketing plan
  useCopilotAction({
    name: 'approveMarketingPlan',
    description: 'Approve a marketing plan to activate it and enable content generation',
    parameters: [
      {
        name: 'planId',
        type: 'string',
        description: 'The ID of the marketing plan to approve',
        required: true,
      },
    ],
    handler: async ({ planId }) => {
      const result = await approveMarketingPlan(planId)

      if (result.success) {
        // Reload plans
        const plansData = await getCompanyPlans(companyId)
        setPlans(plansData)

        return `✅ Marketing plan approved and activated! You can now start generating content based on this strategy. Would you like me to create a content calendar?`
      } else {
        return `Failed to approve plan: ${result.error}`
      }
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const activePlan = plans.find((p) => p.status === 'active')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Marketing Plans</h1>
        <p className="mt-2 text-gray-600">
          AI-generated marketing strategies for {company?.name}
        </p>
      </div>

      {/* No Plans State */}
      {plans.length === 0 && !generating && (
        <div className="rounded-lg border bg-white p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No marketing plans yet</h3>
          <p className="mt-2 text-gray-600">
            {!research
              ? 'Please perform market research first, then ask the AI assistant to generate a marketing plan'
              : 'Ask the AI assistant to generate a comprehensive marketing plan based on your research'}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Try: "Generate a marketing plan for this company"
          </p>
        </div>
      )}

      {/* Generating State */}
      {generating && (
        <div className="rounded-lg border bg-white p-12 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium">Generating your marketing plan...</h3>
          <p className="mt-2 text-gray-600">
            This may take a moment while I analyze your business and create a custom strategy
          </p>
        </div>
      )}

      {/* Plans List */}
      {plans.length > 0 && (
        <div className="space-y-6">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{plan.title}</h3>
                    {plan.status === 'active' && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Active
                      </span>
                    )}
                    {plan.status === 'draft' && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600">{plan.description}</p>

                  {/* Quick Stats */}
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">{plan.goals?.length || 0}</div>
                        <div className="text-xs text-gray-500">Goals</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm font-medium">{plan.content_pillars?.length || 0}</div>
                        <div className="text-xs text-gray-500">Pillars</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="text-sm font-medium">{plan.campaigns?.length || 0}</div>
                        <div className="text-xs text-gray-500">Campaigns</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="text-sm font-medium">{plan.kpis?.length || 0}</div>
                        <div className="text-xs text-gray-500">KPIs</div>
                      </div>
                    </div>
                  </div>

                  {/* Goals Preview */}
                  {plan.goals && plan.goals.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">Key Goals:</h4>
                      <ul className="space-y-1">
                        {plan.goals.slice(0, 3).map((goal, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>
                              <strong>{goal.title}:</strong> {goal.target} in {goal.timeframe}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Content Pillars Preview */}
                  {plan.content_pillars && plan.content_pillars.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-2 font-medium">Content Distribution:</h4>
                      <div className="flex gap-2">
                        {plan.content_pillars.map((pillar, index) => (
                          <div
                            key={index}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm"
                          >
                            <div className="font-medium">{pillar.name}</div>
                            <div className="text-xs text-gray-600">{pillar.percentage}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                {plan.status === 'draft' && (
                  <Button onClick={() => approveMarketingPlan(plan.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Plan
                  </Button>
                )}
                {plan.status === 'active' && (
                  <Link href={`/dashboard/companies/${companyId}/calendar`}>
                    <Button>
                      <Calendar className="mr-2 h-4 w-4" />
                      Create Content Calendar
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
