// Application type definitions

export interface Company {
  id: string
  user_id: string
  name: string
  industry?: string
  description?: string
  products_services?: string[]
  unique_value_proposition?: string
  brand_voice?: string
  brand_guidelines?: BrandGuidelines
  website_url?: string
  logo_url?: string
  target_audience?: TargetAudience
  social_accounts?: SocialAccounts
  onboarding_completed: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
}

export interface BrandGuidelines {
  colors?: string[]
  fonts?: string[]
  tone?: string
  doNot?: string[]
  examples?: string[]
}

export interface TargetAudience {
  demographics?: {
    age_range?: string
    gender?: string
    location?: string[]
    income_level?: string
    education?: string
  }
  psychographics?: {
    interests?: string[]
    values?: string[]
    lifestyle?: string
    personality?: string
  }
  pain_points?: string[]
  behaviors?: {
    online_habits?: string[]
    purchasing_behavior?: string
    preferred_platforms?: string[]
  }
}

export interface SocialAccounts {
  [platform: string]: {
    username?: string
    url?: string
    connected: boolean
    followers?: number
  }
}

export interface MarketResearch {
  id: string
  company_id: string
  competitors: Competitor[]
  trends: Trend[]
  popular_content_formats: ContentFormat[]
  engagement_patterns: EngagementPattern
  hashtag_analysis: HashtagAnalysis[]
  audience_sentiment: AudienceSentiment
  opportunities: Opportunity[]
  threats: Threat[]
  research_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface Competitor {
  name: string
  url?: string
  strengths: string[]
  weaknesses: string[]
  content_strategy?: string
  engagement_rate?: number
  followers?: number
  posting_frequency?: string
}

export interface Trend {
  name: string
  description: string
  relevance_score: number
  platforms: string[]
  timeframe?: string
}

export interface ContentFormat {
  type: string
  platform: string
  engagement_rate: number
  examples?: string[]
}

export interface EngagementPattern {
  best_posting_times?: { [platform: string]: string[] }
  best_posting_days?: { [platform: string]: string[] }
  optimal_frequency?: { [platform: string]: number }
  content_length?: { [platform: string]: string }
}

export interface HashtagAnalysis {
  hashtag: string
  popularity: number
  relevance: number
  competition: 'low' | 'medium' | 'high'
  recommended: boolean
}

export interface AudienceSentiment {
  overall: 'positive' | 'neutral' | 'negative'
  topics: { [topic: string]: string }
  common_feedback: string[]
}

export interface Opportunity {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionable_steps?: string[]
}

export interface Threat {
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  mitigation?: string[]
}

export interface MarketingPlan {
  id: string
  company_id: string
  research_id?: string
  title: string
  description?: string
  goals: Goal[]
  content_pillars: ContentPillar[]
  campaigns: Campaign[]
  key_messaging: string[]
  kpis: KPI[]
  daily_strategy?: Strategy
  weekly_strategy?: Strategy
  monthly_strategy?: Strategy
  yearly_strategy?: Strategy
  status: 'draft' | 'active' | 'archived'
  approved: boolean
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  title: string
  description: string
  metric: string
  target: number | string
  timeframe: string
  type: 'SMART' // Specific, Measurable, Achievable, Relevant, Time-bound
}

export interface ContentPillar {
  name: string
  description: string
  percentage: number // % of content
  content_types: string[]
  examples?: string[]
}

export interface Campaign {
  name: string
  description: string
  objective: string
  duration: string
  platforms: string[]
  budget?: number
  tactics: string[]
}

export interface KPI {
  name: string
  metric: string
  target: number | string
  current?: number | string
  tracking_method: string
}

export interface Strategy {
  focus: string
  activities: string[]
  content_themes: string[]
  expected_outcomes: string[]
}

export interface ContentTopic {
  id: string
  company_id: string
  plan_id?: string
  title: string
  description?: string
  content_pillar?: string
  platform: string[]
  topic_type?: 'educational' | 'promotional' | 'engagement' | 'story'
  keywords?: string[]
  hashtags?: string[]
  suggested_date?: string
  priority: number
  status: 'pending' | 'approved' | 'rejected' | 'used'
  created_at: string
  updated_at: string
}

export interface ContentPost {
  id: string
  company_id: string
  topic_id?: string
  plan_id?: string
  platform: string
  caption: string
  hashtags?: string[]
  call_to_action?: string
  media_urls?: string[]
  media_type?: 'image' | 'video' | 'carousel' | 'text'
  scheduled_date?: string
  published_date?: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  likes: number
  comments: number
  shares: number
  reach: number
  generated_by_ai: boolean
  generation_prompt?: string
  created_at: string
  updated_at: string
}

export interface ContentCalendar {
  id: string
  company_id: string
  plan_id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  posting_frequency?: PostingFrequency
  active: boolean
  created_at: string
  updated_at: string
}

export interface PostingFrequency {
  [platform: string]: {
    posts_per_week: number
    preferred_times: string[]
  }
}

export interface AutomationSettings {
  id: string
  company_id: string
  auto_generation_enabled: boolean
  auto_scheduling_enabled: boolean
  auto_publishing_enabled: boolean
  generation_frequency?: 'daily' | 'weekly' | 'monthly'
  content_approval_required: boolean
  platforms_enabled?: { [platform: string]: boolean }
  notify_on_generation: boolean
  notify_on_publish: boolean
  notification_email?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  company_id?: string
  messages: Message[]
  context?: ConversationContext
  intent?: 'onboarding' | 'research' | 'planning' | 'content_creation'
  active: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface ConversationContext {
  current_step?: string
  collected_data?: any
  pending_actions?: string[]
}
