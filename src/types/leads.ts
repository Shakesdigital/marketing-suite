// Lead Generation Types

export type LeadStatus = 'new' | 'contacted' | 'responded' | 'qualified' | 'converted' | 'lost'
export type OutreachStatus = 'pending' | 'sent' | 'opened' | 'replied' | 'bounced'
export type LeadSource = 'ai_research' | 'manual' | 'import' | 'api'
export type CollaborationType = 'content' | 'partnership' | 'sponsorship' | 'affiliate'
export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise'

export interface Lead {
  id: string
  company_id: string
  
  // Lead Information
  business_name: string
  industry?: string
  location?: string
  company_size?: CompanySize
  website_url?: string
  
  // Contact Information
  contact_name?: string
  contact_title?: string
  contact_email?: string
  contact_phone?: string
  contact_linkedin?: string
  
  // Lead Intelligence
  description?: string
  pain_points?: string[]
  products_services?: string[]
  revenue_estimate?: string
  employee_count?: string
  funding_stage?: string
  
  // Engagement & Outreach
  lead_score: number
  lead_status: LeadStatus
  outreach_status: OutreachStatus
  
  // Sourcing
  source: LeadSource
  research_criteria?: ResearchCriteria
  
  // Notes & Tags
  notes?: string
  tags?: string[]
  
  // Collaboration Potential
  collaboration_type?: CollaborationType[]
  match_reasons?: string[]
  
  // Tracking
  first_contacted_at?: string
  last_contacted_at?: string
  converted_at?: string
  
  created_at: string
  updated_at: string
}

export interface ResearchCriteria {
  industry?: string[]
  location?: string[]
  company_size?: CompanySize[]
  keywords?: string[]
  exclude_keywords?: string[]
  min_employees?: number
  max_employees?: number
  revenue_range?: string
  funding_stages?: string[]
  technologies?: string[]
  collaboration_types?: CollaborationType[]
}

export interface LeadResearchSession {
  id: string
  company_id: string
  
  search_criteria: ResearchCriteria
  target_count: number
  
  leads_found: number
  leads_imported: number
  
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  error_message?: string
  
  research_duration_seconds?: number
  ai_model_used?: string
  
  created_at: string
  updated_at: string
}

export interface LeadFormData {
  business_name: string
  industry?: string
  location?: string
  company_size?: CompanySize
  website_url?: string
  contact_email?: string
  contact_name?: string
  notes?: string
}
