// Email Marketing Types

export type EmailTemplateCategory = 'outreach' | 'follow_up' | 'collaboration' | 'newsletter' | 'custom'
export type EmailCampaignType = 'one_time' | 'drip' | 'sequence' | 'newsletter'
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type EmailOutreachStatus = 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
export type EmailProvider = 'sendgrid' | 'ses' | 'smtp' | 'mailgun' | 'postmark'

export interface EmailTemplate {
  id: string
  company_id: string
  
  // Template Details
  name: string
  description?: string
  category: EmailTemplateCategory
  
  // Email Content
  subject_line: string
  preview_text?: string
  body_html: string
  body_text: string
  
  // Personalization
  personalization_fields?: string[]
  dynamic_content?: Record<string, any>
  
  // A/B Testing
  is_variant: boolean
  parent_template_id?: string
  variant_name?: string
  
  // Performance
  times_sent: number
  open_rate?: number
  click_rate?: number
  reply_rate?: number
  
  // Status
  is_active: boolean
  is_default: boolean
  
  created_at: string
  updated_at: string
}

export interface EmailCampaign {
  id: string
  company_id: string
  template_id?: string
  
  // Campaign Details
  name: string
  description?: string
  campaign_type: EmailCampaignType
  
  // Targeting
  target_leads?: string[]
  target_segments?: Record<string, any>
  
  // Scheduling
  scheduled_date?: string
  send_date?: string
  
  // Drip/Sequence Settings
  sequence_steps?: SequenceStep[]
  current_step: number
  
  // Status
  status: EmailCampaignStatus
  
  // Performance Metrics
  total_recipients: number
  emails_sent: number
  emails_delivered: number
  emails_opened: number
  emails_clicked: number
  emails_replied: number
  emails_bounced: number
  unsubscribed: number
  
  created_at: string
  updated_at: string
}

export interface SequenceStep {
  step: number
  delay_days: number
  template_id: string
  name?: string
}

export interface EmailOutreach {
  id: string
  company_id: string
  campaign_id?: string
  lead_id: string
  template_id?: string
  
  // Email Details
  subject: string
  body_html: string
  body_text: string
  from_email: string
  from_name?: string
  to_email: string
  to_name?: string
  
  // Personalized Content
  personalization_data?: Record<string, any>
  
  // Tracking
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  replied_at?: string
  bounced_at?: string
  
  // Engagement Details
  opens_count: number
  clicks_count: number
  click_urls?: string[]
  
  // Status
  status: EmailOutreachStatus
  error_message?: string
  
  // SMTP/Provider Info
  email_provider?: EmailProvider
  message_id?: string
  
  created_at: string
  updated_at: string
}

export interface EmailIntegrationSettings {
  id: string
  company_id: string
  
  // Provider Configuration
  provider: EmailProvider
  api_key_encrypted?: string
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password_encrypted?: string
  
  // Sender Configuration
  from_email: string
  from_name: string
  reply_to_email?: string
  
  // Settings
  daily_send_limit: number
  emails_sent_today: number
  tracking_enabled: boolean
  
  // Compliance
  include_unsubscribe_link: boolean
  gdpr_compliant: boolean
  footer_text?: string
  
  // Status
  is_verified: boolean
  is_active: boolean
  last_verified_at?: string
  
  created_at: string
  updated_at: string
}

export interface EmailTemplateFormData {
  name: string
  description?: string
  category: EmailTemplateCategory
  subject_line: string
  preview_text?: string
  body_html: string
  body_text: string
}

export interface EmailCampaignFormData {
  name: string
  description?: string
  campaign_type: EmailCampaignType
  template_id?: string
  target_leads?: string[]
  scheduled_date?: string
}
