// Blog Content Types

export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type TrendingTopicStatus = 'discovered' | 'approved' | 'in_progress' | 'used' | 'rejected'
export type CompetitionLevel = 'low' | 'medium' | 'high'

export interface BlogPost {
  id: string
  company_id: string
  plan_id?: string
  
  // Post Details
  title: string
  slug?: string
  meta_description?: string
  
  // Content
  content: string
  excerpt?: string
  featured_image_url?: string
  
  // SEO
  seo_title?: string
  seo_keywords?: string[]
  focus_keyword?: string
  internal_links?: string[]
  external_links?: string[]
  
  // Categorization
  category?: string
  tags?: string[]
  content_pillar?: string
  
  // Publishing
  scheduled_date?: string
  published_date?: string
  
  // Status
  status: BlogPostStatus
  
  // Performance Metrics
  views: number
  unique_visitors: number
  avg_time_on_page?: number
  bounce_rate?: number
  shares: number
  comments_count: number
  
  // AI Generation
  generated_by_ai: boolean
  generation_prompt?: string
  trending_topics_used?: TrendingTopic[]
  
  // Publishing Integrations
  wordpress_post_id?: string
  medium_post_id?: string
  external_url?: string
  
  // Author
  author_name?: string
  author_bio?: string
  
  created_at: string
  updated_at: string
}

export interface TrendingTopic {
  id: string
  company_id: string
  
  // Topic Details
  topic: string
  description?: string
  keywords?: string[]
  hashtags?: string[]
  
  // Trend Data
  trend_score: number
  search_volume?: number
  competition_level?: CompetitionLevel
  
  // Sources
  sources?: TrendSource[]
  related_topics?: string[]
  
  // Relevance
  relevance_score: number
  relevance_reasons?: string[]
  
  // Angles & Ideas
  content_angles?: ContentAngle[]
  suggested_titles?: string[]
  
  // Status
  status: TrendingTopicStatus
  used_in_blog_post_id?: string
  
  // Timing
  discovered_at: string
  trending_until?: string
  
  created_at: string
  updated_at: string
}

export interface TrendSource {
  platform: string
  url?: string
  mentions: number
  engagement: number
}

export interface ContentAngle {
  angle: string
  description: string
  target_audience: string
  estimated_word_count: number
}

export interface BlogPublishingSettings {
  id: string
  company_id: string
  
  // WordPress Integration
  wordpress_enabled: boolean
  wordpress_site_url?: string
  wordpress_username?: string
  wordpress_app_password_encrypted?: string
  
  // Medium Integration
  medium_enabled: boolean
  medium_access_token_encrypted?: string
  medium_author_id?: string
  
  // Publishing Preferences
  auto_publish_enabled: boolean
  publish_as_draft: boolean
  default_category?: string
  default_tags?: string[]
  
  // SEO Settings
  auto_generate_meta: boolean
  auto_generate_slug: boolean
  include_author_bio: boolean
  
  created_at: string
  updated_at: string
}

export interface BlogPostFormData {
  title: string
  content: string
  excerpt?: string
  category?: string
  tags?: string[]
  seo_keywords?: string[]
  focus_keyword?: string
  scheduled_date?: string
}

export interface TrendingTopicFormData {
  topic: string
  description?: string
  keywords?: string[]
  status?: TrendingTopicStatus
}
