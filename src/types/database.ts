// Database type definitions

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          role: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          user_id: string
          name: string
          industry: string | null
          description: string | null
          products_services: string[] | null
          unique_value_proposition: string | null
          brand_voice: string | null
          brand_guidelines: Json | null
          website_url: string | null
          logo_url: string | null
          target_audience: Json | null
          social_accounts: Json | null
          onboarding_completed: boolean
          onboarding_step: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          industry?: string | null
          description?: string | null
          products_services?: string[] | null
          unique_value_proposition?: string | null
          brand_voice?: string | null
          brand_guidelines?: Json | null
          website_url?: string | null
          logo_url?: string | null
          target_audience?: Json | null
          social_accounts?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          industry?: string | null
          description?: string | null
          products_services?: string[] | null
          unique_value_proposition?: string | null
          brand_voice?: string | null
          brand_guidelines?: Json | null
          website_url?: string | null
          logo_url?: string | null
          target_audience?: Json | null
          social_accounts?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          created_at?: string
          updated_at?: string
        }
      }
      market_research: {
        Row: {
          id: string
          company_id: string
          competitors: Json[] | null
          trends: Json[] | null
          popular_content_formats: Json[] | null
          engagement_patterns: Json | null
          hashtag_analysis: Json[] | null
          audience_sentiment: Json | null
          opportunities: Json[] | null
          threats: Json[] | null
          research_date: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          competitors?: Json[] | null
          trends?: Json[] | null
          popular_content_formats?: Json[] | null
          engagement_patterns?: Json | null
          hashtag_analysis?: Json[] | null
          audience_sentiment?: Json | null
          opportunities?: Json[] | null
          threats?: Json[] | null
          research_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          competitors?: Json[] | null
          trends?: Json[] | null
          popular_content_formats?: Json[] | null
          engagement_patterns?: Json | null
          hashtag_analysis?: Json[] | null
          audience_sentiment?: Json | null
          opportunities?: Json[] | null
          threats?: Json[] | null
          research_date?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      marketing_plans: {
        Row: {
          id: string
          company_id: string
          research_id: string | null
          title: string
          description: string | null
          goals: Json[] | null
          content_pillars: Json[] | null
          campaigns: Json[] | null
          key_messaging: string[] | null
          kpis: Json[] | null
          daily_strategy: Json | null
          weekly_strategy: Json | null
          monthly_strategy: Json | null
          yearly_strategy: Json | null
          status: string
          approved: boolean
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          research_id?: string | null
          title: string
          description?: string | null
          goals?: Json[] | null
          content_pillars?: Json[] | null
          campaigns?: Json[] | null
          key_messaging?: string[] | null
          kpis?: Json[] | null
          daily_strategy?: Json | null
          weekly_strategy?: Json | null
          monthly_strategy?: Json | null
          yearly_strategy?: Json | null
          status?: string
          approved?: boolean
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          research_id?: string | null
          title?: string
          description?: string | null
          goals?: Json[] | null
          content_pillars?: Json[] | null
          campaigns?: Json[] | null
          key_messaging?: string[] | null
          kpis?: Json[] | null
          daily_strategy?: Json | null
          weekly_strategy?: Json | null
          monthly_strategy?: Json | null
          yearly_strategy?: Json | null
          status?: string
          approved?: boolean
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_topics: {
        Row: {
          id: string
          company_id: string
          plan_id: string | null
          title: string
          description: string | null
          content_pillar: string | null
          platform: string[] | null
          topic_type: string | null
          keywords: string[] | null
          hashtags: string[] | null
          suggested_date: string | null
          priority: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          plan_id?: string | null
          title: string
          description?: string | null
          content_pillar?: string | null
          platform?: string[] | null
          topic_type?: string | null
          keywords?: string[] | null
          hashtags?: string[] | null
          suggested_date?: string | null
          priority?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          plan_id?: string | null
          title?: string
          description?: string | null
          content_pillar?: string | null
          platform?: string[] | null
          topic_type?: string | null
          keywords?: string[] | null
          hashtags?: string[] | null
          suggested_date?: string | null
          priority?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      content_posts: {
        Row: {
          id: string
          company_id: string
          topic_id: string | null
          plan_id: string | null
          platform: string
          caption: string
          hashtags: string[] | null
          call_to_action: string | null
          media_urls: string[] | null
          media_type: string | null
          scheduled_date: string | null
          published_date: string | null
          status: string
          likes: number
          comments: number
          shares: number
          reach: number
          generated_by_ai: boolean
          generation_prompt: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          topic_id?: string | null
          plan_id?: string | null
          platform: string
          caption: string
          hashtags?: string[] | null
          call_to_action?: string | null
          media_urls?: string[] | null
          media_type?: string | null
          scheduled_date?: string | null
          published_date?: string | null
          status?: string
          likes?: number
          comments?: number
          shares?: number
          reach?: number
          generated_by_ai?: boolean
          generation_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          topic_id?: string | null
          plan_id?: string | null
          platform?: string
          caption?: string
          hashtags?: string[] | null
          call_to_action?: string | null
          media_urls?: string[] | null
          media_type?: string | null
          scheduled_date?: string | null
          published_date?: string | null
          status?: string
          likes?: number
          comments?: number
          shares?: number
          reach?: number
          generated_by_ai?: boolean
          generation_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_calendar: {
        Row: {
          id: string
          company_id: string
          plan_id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          posting_frequency: Json | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          plan_id: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          posting_frequency?: Json | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          plan_id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          posting_frequency?: Json | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      automation_settings: {
        Row: {
          id: string
          company_id: string
          auto_generation_enabled: boolean
          auto_scheduling_enabled: boolean
          auto_publishing_enabled: boolean
          generation_frequency: string | null
          content_approval_required: boolean
          platforms_enabled: Json | null
          notify_on_generation: boolean
          notify_on_publish: boolean
          notification_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          auto_generation_enabled?: boolean
          auto_scheduling_enabled?: boolean
          auto_publishing_enabled?: boolean
          generation_frequency?: string | null
          content_approval_required?: boolean
          platforms_enabled?: Json | null
          notify_on_generation?: boolean
          notify_on_publish?: boolean
          notification_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          auto_generation_enabled?: boolean
          auto_scheduling_enabled?: boolean
          auto_publishing_enabled?: boolean
          generation_frequency?: string | null
          content_approval_required?: boolean
          platforms_enabled?: Json | null
          notify_on_generation?: boolean
          notify_on_publish?: boolean
          notification_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          company_id: string | null
          messages: Json[] | null
          context: Json | null
          intent: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id?: string | null
          messages?: Json[] | null
          context?: Json | null
          intent?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string | null
          messages?: Json[] | null
          context?: Json | null
          intent?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
