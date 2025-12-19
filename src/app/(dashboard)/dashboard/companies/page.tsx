'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Company } from '@/types'
import { Button } from '@/components/ui/button'
import { Plus, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setCompanies(data as Company[] || [])
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Companies</h1>
          <p className="mt-2 text-gray-600">Manage all your businesses in one place</p>
        </div>
        <Link href="/dashboard/companies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No companies yet</h3>
          <p className="mt-2 text-gray-600">Get started by adding your first business</p>
          <Link href="/dashboard/companies/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Company
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  )
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/dashboard/companies/${company.id}`}>
      <div className="rounded-lg border bg-white p-6 transition-shadow hover:shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{company.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{company.industry || 'No industry'}</p>
            {company.description && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-700">{company.description}</p>
            )}
          </div>
          {company.onboarding_completed ? (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
              Active
            </span>
          ) : (
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Setup
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div className="flex gap-2">
            {company.social_accounts && Object.keys(company.social_accounts).length > 0 ? (
              <span className="text-xs text-gray-500">
                {Object.keys(company.social_accounts).length} platforms
              </span>
            ) : (
              <span className="text-xs text-gray-400">No platforms</span>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </Link>
  )
}
