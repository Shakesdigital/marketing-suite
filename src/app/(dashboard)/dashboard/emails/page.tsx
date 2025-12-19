'use client'

import { useState, useEffect } from 'react'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { EmailTemplate, EmailCampaign } from '@/types/email'
import { Lead } from '@/types/leads'
import { 
  generateEmailForLead, 
  createEmailTemplate, 
  getEmailTemplates,
  createEmailCampaign,
  getEmailCampaigns,
  sendEmailCampaign,
  generateEmailVariants,
  getCampaignAnalytics
} from '@/lib/actions/email-actions'
import { getLeads } from '@/lib/actions/lead-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Mail, 
  Send, 
  FileText, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  Eye,
  MousePointer,
  Reply,
  Sparkles,
  Plus,
  PlayCircle
} from 'lucide-react'

export default function EmailsPage() {
  const [companyId, setCompanyId] = useState<string>('')
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const pathParts = window.location.pathname.split('/')
      const id = pathParts[pathParts.indexOf('companies') + 1]
      
      if (id && id !== 'emails') {
        setCompanyId(id)
        const [templatesData, campaignsData, leadsData] = await Promise.all([
          getEmailTemplates(id),
          getEmailCampaigns(id),
          getLeads(id)
        ])
        
        setTemplates(templatesData)
        setCampaigns(campaignsData)
        setLeads(leadsData)
      }
    } catch (error) {
      console.error('Error loading email data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Make data readable to CopilotKit
  useCopilotReadable({
    description: 'Email templates available',
    value: templates,
  })

  useCopilotReadable({
    description: 'Email campaigns and their status',
    value: campaigns,
  })

  useCopilotReadable({
    description: 'Available leads for email outreach',
    value: leads,
  })

  // CopilotKit Action: Generate personalized email for a lead
  useCopilotAction({
    name: 'generateEmail',
    description: 'Generate a personalized outreach email for a specific lead using AI',
    parameters: [
      {
        name: 'leadId',
        type: 'string',
        description: 'ID of the lead to generate email for',
        required: true,
      },
      {
        name: 'emailType',
        type: 'string',
        description: 'Type of email: outreach, follow_up, or collaboration',
        required: false,
      },
    ],
    handler: async ({ leadId, emailType = 'outreach' }) => {
      const result = await generateEmailForLead(companyId, leadId, emailType as any)
      
      if (result.success && result.email) {
        return `Generated email:\n\nSubject: ${result.email.subject}\n\nBody:\n${result.email.body}\n\nWould you like me to save this as a template or create a campaign?`
      } else {
        return `Failed to generate email: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Create email template
  useCopilotAction({
    name: 'createEmailTemplate',
    description: 'Create a new email template for reusable outreach campaigns',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Template name',
        required: true,
      },
      {
        name: 'subject',
        type: 'string',
        description: 'Email subject line',
        required: true,
      },
      {
        name: 'body',
        type: 'string',
        description: 'Email body text',
        required: true,
      },
      {
        name: 'category',
        type: 'string',
        description: 'Category: outreach, follow_up, collaboration, newsletter, custom',
        required: false,
      },
    ],
    handler: async ({ name, subject, body, category = 'outreach' }) => {
      const result = await createEmailTemplate(companyId, {
        name,
        subject_line: subject,
        body_text: body,
        body_html: `<p>${body.replace(/\n/g, '</p><p>')}</p>`,
        category: category as any,
      })

      if (result.success && result.template) {
        setTemplates([result.template, ...templates])
        return `Successfully created email template "${name}"!`
      } else {
        return `Failed to create template: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Create email campaign
  useCopilotAction({
    name: 'createEmailCampaign',
    description: 'Create a new email campaign to send to multiple leads',
    parameters: [
      {
        name: 'name',
        type: 'string',
        description: 'Campaign name',
        required: true,
      },
      {
        name: 'templateId',
        type: 'string',
        description: 'Email template ID to use',
        required: true,
      },
      {
        name: 'leadIds',
        type: 'string[]',
        description: 'Array of lead IDs to target',
        required: true,
      },
      {
        name: 'scheduledDate',
        type: 'string',
        description: 'When to send (ISO date string)',
        required: false,
      },
    ],
    handler: async ({ name, templateId, leadIds, scheduledDate }) => {
      const result = await createEmailCampaign(companyId, {
        name,
        template_id: templateId,
        target_leads: leadIds,
        scheduled_date: scheduledDate,
        campaign_type: 'one_time',
      })

      if (result.success && result.campaign) {
        setCampaigns([result.campaign, ...campaigns])
        return `Successfully created campaign "${name}" targeting ${leadIds.length} leads!`
      } else {
        return `Failed to create campaign: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Send email campaign
  useCopilotAction({
    name: 'sendCampaign',
    description: 'Send or schedule an email campaign to start outreach',
    parameters: [
      {
        name: 'campaignId',
        type: 'string',
        description: 'ID of the campaign to send',
        required: true,
      },
    ],
    handler: async ({ campaignId }) => {
      const result = await sendEmailCampaign(campaignId)
      
      if (result.success) {
        await loadData()
        return `Campaign queued successfully! ${result.emailsQueued} emails are ready to send.`
      } else {
        return `Failed to send campaign: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Generate A/B test variants
  useCopilotAction({
    name: 'generateEmailVariants',
    description: 'Generate A/B test variants of an email template to optimize performance',
    parameters: [
      {
        name: 'templateId',
        type: 'string',
        description: 'Template ID to create variants for',
        required: true,
      },
      {
        name: 'variantCount',
        type: 'number',
        description: 'Number of variants to generate (default: 2)',
        required: false,
      },
    ],
    handler: async ({ templateId, variantCount = 2 }) => {
      const result = await generateEmailVariants(templateId, variantCount)
      
      if (result.success && result.variants) {
        await loadData()
        return `Successfully generated ${result.variants.length} A/B test variants! Test different approaches to optimize your email performance.`
      } else {
        return `Failed to generate variants: ${result.error}`
      }
    },
  })

  // CopilotKit Action: Bulk generate emails for qualified leads
  useCopilotAction({
    name: 'bulkGenerateEmails',
    description: 'Generate personalized emails for multiple qualified leads at once',
    parameters: [
      {
        name: 'leadStatus',
        type: 'string',
        description: 'Target leads with this status (e.g., "qualified", "new")',
        required: false,
      },
      {
        name: 'maxLeads',
        type: 'number',
        description: 'Maximum number of leads to process',
        required: false,
      },
    ],
    handler: async ({ leadStatus = 'qualified', maxLeads = 10 }) => {
      const targetLeads = leads
        .filter(l => l.lead_status === leadStatus)
        .slice(0, maxLeads)

      if (targetLeads.length === 0) {
        return `No leads found with status "${leadStatus}"`
      }

      return `Found ${targetLeads.length} ${leadStatus} leads. I can generate personalized emails for each one. Should I create a campaign template or generate individual emails?`
    },
  })

  const stats = {
    totalCampaigns: campaigns.length,
    active: campaigns.filter(c => c.status === 'scheduled' || c.status === 'sending').length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    totalTemplates: templates.length,
    draftCampaigns: campaigns.filter(c => c.status === 'draft').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading email campaigns...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Marketing & Outreach</h1>
        <p className="text-gray-600">
          Create personalized email campaigns powered by AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Campaigns</p>
              <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold">{stats.sent}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Templates</p>
              <p className="text-2xl font-bold">{stats.totalTemplates}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-4">
          <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">AI Email Assistant</h3>
            <p className="text-sm text-gray-700 mb-3">
              I can help you create personalized email campaigns! Try: "Generate an outreach email for lead [name]" 
              or "Create a follow-up email campaign for all qualified leads" or "Generate A/B test variants for my best template"
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Email
              </Button>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'campaigns'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'templates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      {activeTab === 'campaigns' ? (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <Card className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first email campaign to start reaching out to leads
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{campaign.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                        campaign.status === 'scheduled' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    {campaign.description && (
                      <p className="text-gray-600 mb-2">{campaign.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Recipients: {campaign.total_recipients}</span>
                      <span>Type: {campaign.campaign_type}</span>
                      {campaign.scheduled_date && (
                        <span>Scheduled: {new Date(campaign.scheduled_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Campaign Stats */}
                {campaign.status !== 'draft' && (
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                        <Send className="h-4 w-4" />
                        <span className="text-xs">Sent</span>
                      </div>
                      <p className="text-2xl font-bold">{campaign.emails_sent}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">Opened</span>
                      </div>
                      <p className="text-2xl font-bold">{campaign.emails_opened}</p>
                      <p className="text-xs text-gray-500">
                        {campaign.emails_delivered > 0 
                          ? `${((campaign.emails_opened / campaign.emails_delivered) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                        <MousePointer className="h-4 w-4" />
                        <span className="text-xs">Clicked</span>
                      </div>
                      <p className="text-2xl font-bold">{campaign.emails_clicked}</p>
                      <p className="text-xs text-gray-500">
                        {campaign.emails_opened > 0 
                          ? `${((campaign.emails_clicked / campaign.emails_opened) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                        <Reply className="h-4 w-4" />
                        <span className="text-xs">Replied</span>
                      </div>
                      <p className="text-2xl font-bold">{campaign.emails_replied}</p>
                      <p className="text-xs text-gray-500">
                        {campaign.emails_delivered > 0 
                          ? `${((campaign.emails_replied / campaign.emails_delivered) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-gray-600 mb-4">
                Create email templates to reuse in campaigns
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{template.name}</h3>
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                        {template.category}
                      </span>
                      {template.is_variant && (
                        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-medium">
                          Variant {template.variant_name}
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-gray-600 mb-3">{template.description}</p>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="font-medium text-sm mb-2">Subject: {template.subject_line}</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{template.body_text}</p>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>Used: {template.times_sent} times</span>
                      {template.open_rate && <span>Open Rate: {template.open_rate}%</span>}
                      {template.reply_rate && <span>Reply Rate: {template.reply_rate}%</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      A/B Test
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
