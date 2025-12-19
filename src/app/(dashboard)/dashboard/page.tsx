'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Company } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, Calendar, FileText, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalPlans: 0,
    scheduledPosts: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load companies
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (companiesData) {
        setCompanies(companiesData as Company[])

        // Calculate stats
        const activeCompanies = companiesData.filter((c) => c.onboarding_completed).length

        // Get marketing plans count
        const { count: plansCount } = await supabase
          .from('marketing_plans')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companiesData[0]?.id || '')

        // Get scheduled posts count
        const { count: postsCount } = await supabase
          .from('content_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'scheduled')

        setStats({
          totalCompanies: companiesData.length,
          activeCompanies,
          totalPlans: plansCount || 0,
          scheduledPosts: postsCount || 0,
        })
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your marketing activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
          title="Active Companies"
          value={stats.activeCompanies}
          subtitle={`${stats.totalCompanies} total`}
        />
        <StatCard
          icon={<FileText className="h-6 w-6 text-green-600" />}
          title="Marketing Plans"
          value={stats.totalPlans}
          subtitle="Active plans"
        />
        <StatCard
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          title="Scheduled Posts"
          value={stats.scheduledPosts}
          subtitle="Ready to publish"
        />
        <StatCard
          icon={<Zap className="h-6 w-6 text-orange-600" />}
          title="Automation"
          value="Active"
          subtitle="Content generation"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            title="Add New Company"
            description="Start onboarding a new business"
            icon={<Plus className="h-6 w-6" />}
            href="/dashboard/companies/new"
          />
          <ActionCard
            title="View Content Calendar"
            description="Review and edit scheduled posts"
            icon={<Calendar className="h-6 w-6" />}
            href="/dashboard/calendar"
          />
          <ActionCard
            title="Generate Content"
            description="Create new social media posts"
            icon={<Zap className="h-6 w-6" />}
            href="/dashboard/content/generate"
          />
        </div>
      </div>

      {/* Companies List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Companies</h2>
          <Link href="/dashboard/companies/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </Link>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No companies yet</h3>
            <p className="mt-2 text-gray-600">
              Get started by adding your first business
            </p>
            <Link href="/dashboard/companies/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Company
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>{icon}</div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
      </div>
    </div>
  )
}

function ActionCard({ title, description, icon, href }: any) {
  return (
    <Link href={href}>
      <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md">
        <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  )
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/dashboard/companies/${company.id}`}>
      <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{company.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{company.industry || 'No industry set'}</p>
          </div>
          {company.onboarding_completed ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Active
            </span>
          ) : (
            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Setup
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
