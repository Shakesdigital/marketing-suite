'use client'

import { useState, useEffect } from 'react'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { Lead, ResearchCriteria, CompanySize } from '@/types/leads'
import { researchLeads, getLeads, updateLeadStatus, exportLeadsToCSV, addLead, deleteLead, enrichLead } from '@/lib/actions/lead-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Mail, 
  TrendingUp, 
  Filter,
  Star,
  MapPin,
  Building,
  ExternalLink,
  Trash2,
  Sparkles
} from 'lucide-react'

export default function LeadsPage() {
  const [companyId, setCompanyId] = useState<string>('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [researching, setResearching] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Load company and leads
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Get current company from URL or storage
      const pathParts = window.location.pathname.split('/')
      const id = pathParts[pathParts.indexOf('companies') + 1]
      
      if (id && id !== 'leads') {
        setCompanyId(id)
        const leadsData = await getLeads(id)
        setLeads(leadsData)
      }
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setLoading(false)
    }
  }

  // Make leads data readable to CopilotKit
  useCopilotReadable({
    description: 'Current leads for the company',
    value: leads,
  })

  useCopilotReadable({
    description: 'Currently selected lead details',
    value: selectedLead,
  })

  // CopilotKit Action: Research and generate new leads
  useCopilotAction({
    name: 'researchLeads',
    description: 'Research and generate new business leads based on search criteria using AI. Use this when the user wants to find potential clients, partners, or collaboration opportunities.',
    parameters: [
      {
        name: 'industry',
        type: 'string[]',
        description: 'Target industries (e.g., ["technology", "healthcare", "finance"])',
        required: false,
      },
      {
        name: 'location',
        type: 'string[]',
        description: 'Target locations (e.g., ["United States", "United Kingdom", "Remote"])',
        required: false,
      },
      {
        name: 'companySize',
        type: 'string[]',
        description: 'Company sizes: small, medium, large, enterprise',
        required: false,
      },
      {
        name: 'keywords',
        type: 'string[]',
        description: 'Keywords related to target businesses',
        required: false,
      },
      {
        name: 'collaborationTypes',
        type: 'string[]',
        description: 'Types of collaboration: content, partnership, sponsorship, affiliate',
        required: false,
      },
      {
        name: 'targetCount',
        type: 'number',
        description: 'Number of leads to generate (default: 10)',
        required: false,
      },
    ],
    handler: async ({ 
      industry, 
      location, 
      companySize, 
      keywords, 
      collaborationTypes,
      targetCount = 10 
    }) => {
      if (!companyId) {
        return 'No company selected. Please select a company first.'
      }

      setResearching(true)

      const criteria: ResearchCriteria = {
        industry,
        location,
        company_size: companySize as CompanySize[],
        keywords,
        collaboration_types: collaborationTypes as any[],
      }

      const result = await researchLeads(companyId, criteria, targetCount)

      if (result.success && result.leads) {
        setLeads([...result.leads, ...leads])
        setResearching(false)
        return `Successfully generated ${result.leads.length} new leads! They've been added to your leads list with scores and collaboration recommendations.`
      } else {
        setResearching(false)
        return `Failed to generate leads: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Update lead status
  useCopilotAction({
    name: 'updateLeadStatus',
    description: 'Update the status of a lead (new, contacted, responded, qualified, converted, lost)',
    parameters: [
      {
        name: 'leadId',
        type: 'string',
        description: 'ID of the lead to update',
        required: true,
      },
      {
        name: 'status',
        type: 'string',
        description: 'New status: new, contacted, responded, qualified, converted, lost',
        required: true,
      },
    ],
    handler: async ({ leadId, status }) => {
      const result = await updateLeadStatus(leadId, status)
      
      if (result.success) {
        await loadData()
        return `Lead status updated to "${status}"`
      } else {
        return `Failed to update lead: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Export leads to CSV
  useCopilotAction({
    name: 'exportLeads',
    description: 'Export all leads to a CSV file for download or CRM import',
    parameters: [],
    handler: async () => {
      const result = await exportLeadsToCSV(companyId)
      
      if (result.success && result.csv) {
        // Create download link
        const blob = new Blob([result.csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leads-${Date.now()}.csv`
        a.click()
        
        return `Successfully exported ${leads.length} leads to CSV file!`
      } else {
        return `Failed to export leads: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Add lead manually
  useCopilotAction({
    name: 'addLead',
    description: 'Manually add a new lead to the database',
    parameters: [
      {
        name: 'businessName',
        type: 'string',
        description: 'Name of the business',
        required: true,
      },
      {
        name: 'contactEmail',
        type: 'string',
        description: 'Contact email address',
        required: false,
      },
      {
        name: 'contactName',
        type: 'string',
        description: 'Contact person name',
        required: false,
      },
      {
        name: 'industry',
        type: 'string',
        description: 'Industry',
        required: false,
      },
      {
        name: 'location',
        type: 'string',
        description: 'Location',
        required: false,
      },
      {
        name: 'websiteUrl',
        type: 'string',
        description: 'Website URL',
        required: false,
      },
    ],
    handler: async ({ businessName, contactEmail, contactName, industry, location, websiteUrl }) => {
      const result = await addLead(companyId, {
        business_name: businessName,
        contact_email: contactEmail,
        contact_name: contactName,
        industry,
        location,
        website_url: websiteUrl,
      })

      if (result.success && result.lead) {
        setLeads([result.lead, ...leads])
        return `Successfully added "${businessName}" as a new lead!`
      } else {
        return `Failed to add lead: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Enrich lead data
  useCopilotAction({
    name: 'enrichLead',
    description: 'Use AI to enrich a lead with additional business intelligence and insights',
    parameters: [
      {
        name: 'leadId',
        type: 'string',
        description: 'ID of the lead to enrich',
        required: true,
      },
    ],
    handler: async ({ leadId }) => {
      const result = await enrichLead(leadId)
      
      if (result.success && result.lead) {
        await loadData()
        return `Successfully enriched lead data with additional business intelligence!`
      } else {
        return `Failed to enrich lead: ${result.error}`
      }
    },
  })

  const filteredLeads = leads.filter(lead => {
    if (filterStatus === 'all') return true
    return lead.lead_status === filterStatus
  })

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.lead_status === 'new').length,
    contacted: leads.filter(l => l.lead_status === 'contacted').length,
    qualified: leads.filter(l => l.lead_status === 'qualified').length,
    converted: leads.filter(l => l.lead_status === 'converted').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.lead_score, 0) / leads.length) : 0,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading leads...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lead Generation & Research</h1>
        <p className="text-gray-600">
          Discover and manage potential business leads powered by AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold">{stats.new}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Contacted</p>
              <p className="text-2xl font-bold">{stats.contacted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Qualified</p>
              <p className="text-2xl font-bold">{stats.qualified}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold">{stats.avgScore}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => setFilterStatus('all')} variant={filterStatus === 'all' ? 'default' : 'outline'}>
          <Filter className="h-4 w-4 mr-2" />
          All Leads
        </Button>
        <Button onClick={() => setFilterStatus('new')} variant={filterStatus === 'new' ? 'default' : 'outline'}>
          New
        </Button>
        <Button onClick={() => setFilterStatus('contacted')} variant={filterStatus === 'contacted' ? 'default' : 'outline'}>
          Contacted
        </Button>
        <Button onClick={() => setFilterStatus('qualified')} variant={filterStatus === 'qualified' ? 'default' : 'outline'}>
          Qualified
        </Button>
      </div>

      {/* AI Suggestions */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">AI-Powered Lead Research</h3>
            <p className="text-sm text-gray-700 mb-3">
              Ask me to research leads! Try: "Find 10 technology companies in San Francisco interested in content partnerships" 
              or "Research medium-sized healthcare businesses for collaboration"
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={researching}>
                <Search className="h-4 w-4 mr-2" />
                {researching ? 'Researching...' : 'Start Research'}
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <Card className="p-6">
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads yet</h3>
              <p className="text-gray-600 mb-4">
                Start by asking the AI to research leads for your business
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{lead.business_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.lead_score >= 70 ? 'bg-green-100 text-green-700' :
                        lead.lead_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Score: {lead.lead_score}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.lead_status === 'new' ? 'bg-blue-100 text-blue-700' :
                        lead.lead_status === 'contacted' ? 'bg-purple-100 text-purple-700' :
                        lead.lead_status === 'qualified' ? 'bg-orange-100 text-orange-700' :
                        lead.lead_status === 'converted' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lead.lead_status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      {lead.industry && (
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {lead.industry}
                        </span>
                      )}
                      {lead.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {lead.location}
                        </span>
                      )}
                      {lead.contact_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {lead.contact_email}
                        </span>
                      )}
                    </div>

                    {lead.description && (
                      <p className="text-sm text-gray-700 mb-2">{lead.description}</p>
                    )}

                    {lead.match_reasons && lead.match_reasons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lead.match_reasons.map((reason, idx) => (
                          <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {lead.website_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={lead.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
