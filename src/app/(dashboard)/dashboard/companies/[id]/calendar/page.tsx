'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { supabase } from '@/lib/supabase/client'
import { Company, MarketingPlan, ContentPost, ContentCalendar } from '@/types'
import {
  createContentCalendar,
  generateBulkPosts,
  getContentPosts
} from '@/lib/actions/content-actions'
import { getCompanyPlans } from '@/lib/actions/marketing-plan-actions'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, Filter, Download, Sparkles } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'

export default function ContentCalendarPage() {
  const params = useParams()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [plans, setPlans] = useState<MarketingPlan[]>([])
  const [activePlan, setActivePlan] = useState<MarketingPlan | null>(null)
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null)
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [companyId])

  const loadData = async () => {
    try {
      // Load company
      const { data: companyData } = await (supabase
        .from('companies') as any)
        .select('*')
        .eq('id', companyId)
        .single()

      setCompany(companyData ? (companyData as Company) : null)

      // Load plans
      const plansData = await getCompanyPlans(companyId)
      setPlans(plansData)

      const active = plansData.find((p) => p.status === 'active')
      setActivePlan(active || null)

      // Load calendar
      const { data: calendarData } = await (supabase
        .from('content_calendar') as any)
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      setCalendar(calendarData ? (calendarData as ContentCalendar) : null)

      // Load posts
      const postsData = await getContentPosts(companyId)
      setPosts(postsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Make data readable by Copilot
  useCopilotReadable({
    description: 'Company and marketing plan information',
    value: { company, activePlan },
  })

  useCopilotReadable({
    description: 'Content calendar and scheduled posts',
    value: { calendar, posts },
  })

  // Action: Create content calendar
  useCopilotAction({
    name: 'createContentCalendar',
    description: 'Create a content calendar with posting frequency settings for each platform',
    parameters: [
      {
        name: 'postingFrequency',
        type: 'object',
        description: 'Posting frequency per platform, e.g., {"instagram": {"posts_per_week": 5, "preferred_times": ["9:00", "15:00", "19:00"]}}',
        required: true,
      },
    ],
    handler: async ({ postingFrequency }) => {
      if (!company || !activePlan) {
        return 'Please ensure you have an active marketing plan before creating a calendar.'
      }

      const newCalendar = await createContentCalendar(company, activePlan, postingFrequency)

      if (newCalendar) {
        setCalendar(newCalendar)
        return `✅ Content calendar created! Now generating posts based on your posting frequency...`
      }

      return 'Failed to create calendar. Please try again.'
    },
  })

  // Action: Generate content for calendar
  useCopilotAction({
    name: 'generateContentForCalendar',
    description: 'Generate AI-powered social media posts for the content calendar',
    parameters: [
      {
        name: 'weeks',
        type: 'number',
        description: 'Number of weeks to generate content for (default: 4)',
        required: false,
      },
    ],
    handler: async ({ weeks }) => {
      if (!company || !activePlan || !calendar) {
        return 'Please create a content calendar first.'
      }

      setGenerating(true)

      try {
        const startDate = new Date()
        const weeksToGenerate = weeks || 4

        const generatedPosts = await generateBulkPosts(
          company,
          activePlan,
          calendar,
          startDate,
          weeksToGenerate
        )

        setPosts([...generatedPosts, ...posts])
        setGenerating(false)

        return `🎉 Generated ${generatedPosts.length} posts for the next ${weeksToGenerate} weeks! 

Posts are distributed across your platforms following the strategy:
- Instagram: ${(calendar.posting_frequency as any)?.instagram?.posts_per_week || 0} posts/week
- Facebook: ${(calendar.posting_frequency as any)?.facebook?.posts_per_week || 0} posts/week
- LinkedIn: ${(calendar.posting_frequency as any)?.linkedin?.posts_per_week || 0} posts/week

All posts are scheduled and ready to publish. You can review and edit them in the calendar view.`
      } catch (error) {
        setGenerating(false)
        return 'Failed to generate content. Please try again.'
      }
    },
  })

  // Action: Setup automation
  useCopilotAction({
    name: 'setupAutomation',
    description: 'Configure automated content generation and scheduling settings',
    parameters: [
      {
        name: 'autoGenerationEnabled',
        type: 'boolean',
        description: 'Enable automatic content generation',
        required: true,
      },
      {
        name: 'generationFrequency',
        type: 'string',
        description: 'How often to generate new content: daily, weekly, or monthly',
        required: true,
      },
      {
        name: 'autoSchedulingEnabled',
        type: 'boolean',
        description: 'Enable automatic scheduling of generated content',
        required: true,
      },
      {
        name: 'contentApprovalRequired',
        type: 'boolean',
        description: 'Require manual approval before publishing',
        required: false,
      },
    ],
    handler: async ({ autoGenerationEnabled, generationFrequency, autoSchedulingEnabled, contentApprovalRequired }) => {
      if (!company) return 'Company not found.'

      try {
        // Upsert automation settings
        const { error } = await (supabase
          .from('automation_settings') as any)
          .upsert({
            company_id: company.id,
            auto_generation_enabled: autoGenerationEnabled,
            generation_frequency: generationFrequency,
            auto_scheduling_enabled: autoSchedulingEnabled,
            content_approval_required: contentApprovalRequired ?? true,
          })

        if (error) throw error

        return `✅ Automation configured successfully!

Settings:
- Auto Generation: ${autoGenerationEnabled ? 'Enabled' : 'Disabled'}
- Frequency: ${generationFrequency}
- Auto Scheduling: ${autoSchedulingEnabled ? 'Enabled' : 'Disabled'}
- Approval Required: ${contentApprovalRequired ?? true ? 'Yes' : 'No'}

Your content will now be generated ${generationFrequency} and ${autoSchedulingEnabled ? 'automatically scheduled' : 'saved as drafts'}.`
      } catch (error) {
        return 'Failed to configure automation. Please try again.'
      }
    },
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  // Calendar view logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const filteredPosts = selectedPlatform === 'all'
    ? posts
    : posts.filter((p) => p.platform === selectedPlatform)

  const getPostsForDay = (day: Date) => {
    return filteredPosts.filter((post) =>
      post.scheduled_date && isSameDay(parseISO(post.scheduled_date), day)
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Calendar</h1>
            <p className="mt-2 text-gray-600">
              AI-generated and scheduled social media posts
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Content
            </Button>
          </div>
        </div>
      </div>

      {/* No Calendar State */}
      {!calendar && !generating && (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No content calendar yet</h3>
          <p className="mt-2 text-gray-600">
            Ask the AI assistant to create a content calendar and generate posts
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Try: "Create a content calendar with 5 Instagram posts and 3 LinkedIn posts per week"
          </p>
        </div>
      )}

      {/* Generating State */}
      {generating && (
        <div className="rounded-lg border bg-white p-12 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium">Generating your content...</h3>
          <p className="mt-2 text-gray-600">
            Creating AI-powered posts optimized for each platform
          </p>
        </div>
      )}

      {/* Calendar View */}
      {calendar && posts.length > 0 && (
        <div>
          {/* Filters and Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              >
                Previous
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              >
                Next
              </Button>
            </div>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          {/* Calendar Grid */}
          <div className="rounded-lg border bg-white">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {daysInMonth.map((day) => {
                const dayPosts = getPostsForDay(day)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-32 border-b border-r p-2 ${isToday ? 'bg-blue-50' : ''
                      }`}
                  >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                      {format(day, 'd')}
                    </div>

                    <div className="mt-1 space-y-1">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          className={`rounded p-1 text-xs ${post.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                            post.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                              post.platform === 'linkedin' ? 'bg-indigo-100 text-indigo-800' :
                                post.platform === 'twitter' ? 'bg-sky-100 text-sky-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {post.platform} - {format(parseISO(post.scheduled_date!), 'HH:mm')}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <StatCard title="Total Posts" value={posts.length} />
            <StatCard title="Scheduled" value={posts.filter((p) => p.status === 'scheduled').length} />
            <StatCard title="Published" value={posts.filter((p) => p.status === 'published').length} />
            <StatCard title="Drafts" value={posts.filter((p) => p.status === 'draft').length} />
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  )
}
