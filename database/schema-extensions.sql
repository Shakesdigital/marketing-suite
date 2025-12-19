-- Extended Schema for Lead Generation, Email Marketing, and Blog Content
-- Add this to your existing schema.sql or run separately

-- Lead Research & Generation table
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Lead Information
  business_name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  company_size TEXT, -- 'small', 'medium', 'large', 'enterprise'
  website_url TEXT,
  
  -- Contact Information
  contact_name TEXT,
  contact_title TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_linkedin TEXT,
  
  -- Lead Intelligence
  description TEXT,
  pain_points TEXT[],
  products_services TEXT[],
  revenue_estimate TEXT,
  employee_count TEXT,
  funding_stage TEXT,
  
  -- Engagement & Outreach
  lead_score INTEGER DEFAULT 0, -- 0-100 scoring based on fit
  lead_status TEXT DEFAULT 'new', -- 'new', 'contacted', 'responded', 'qualified', 'converted', 'lost'
  outreach_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'opened', 'replied', 'bounced'
  
  -- Sourcing
  source TEXT, -- 'ai_research', 'manual', 'import', 'api'
  research_criteria JSONB, -- Original search criteria used to find this lead
  
  -- Notes & Tags
  notes TEXT,
  tags TEXT[],
  
  -- Collaboration Potential
  collaboration_type TEXT[], -- ['content', 'partnership', 'sponsorship', 'affiliate']
  match_reasons TEXT[], -- Why this lead was recommended
  
  -- Tracking
  first_contacted_at TIMESTAMP WITH TIME ZONE,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Research Sessions table (track research queries)
CREATE TABLE public.lead_research_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Research Parameters
  search_criteria JSONB NOT NULL, -- {industry, location, company_size, keywords, etc.}
  target_count INTEGER DEFAULT 10,
  
  -- Results
  leads_found INTEGER DEFAULT 0,
  leads_imported INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  error_message TEXT,
  
  -- Metadata
  research_duration_seconds INTEGER,
  ai_model_used TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Templates table
CREATE TABLE public.email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Template Details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'outreach', 'follow_up', 'collaboration', 'newsletter', 'custom'
  
  -- Email Content
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  
  -- Personalization
  personalization_fields TEXT[], -- ['company_name', 'contact_name', 'industry', etc.]
  dynamic_content JSONB, -- Conditional content blocks
  
  -- A/B Testing
  is_variant BOOLEAN DEFAULT FALSE,
  parent_template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  variant_name TEXT,
  
  -- Performance
  times_sent INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2),
  click_rate DECIMAL(5,2),
  reply_rate DECIMAL(5,2),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Campaigns table
CREATE TABLE public.email_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  
  -- Campaign Details
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT DEFAULT 'one_time', -- 'one_time', 'drip', 'sequence', 'newsletter'
  
  -- Targeting
  target_leads UUID[], -- Array of lead IDs
  target_segments JSONB, -- Filtering criteria for dynamic targeting
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  send_date TIMESTAMP WITH TIME ZONE,
  
  -- Drip/Sequence Settings (for automated campaigns)
  sequence_steps JSONB[], -- [{step: 1, delay_days: 0, template_id: uuid}, ...]
  current_step INTEGER DEFAULT 1,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'
  
  -- Performance Metrics
  total_recipients INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_replied INTEGER DEFAULT 0,
  emails_bounced INTEGER DEFAULT 0,
  unsubscribed INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Outreach History table (individual email tracking)
CREATE TABLE public.email_outreach (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  
  -- Email Details
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  to_name TEXT,
  
  -- Personalized Content
  personalization_data JSONB, -- All merge fields used
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement Details
  opens_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  click_urls TEXT[],
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'
  error_message TEXT,
  
  -- SMTP/Provider Info
  email_provider TEXT, -- 'sendgrid', 'ses', 'smtp', etc.
  message_id TEXT, -- Provider's message ID for tracking
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts table
CREATE TABLE public.blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.marketing_plans(id) ON DELETE SET NULL,
  
  -- Post Details
  title TEXT NOT NULL,
  slug TEXT,
  meta_description TEXT,
  
  -- Content
  content TEXT NOT NULL, -- Main blog content in Markdown or HTML
  excerpt TEXT,
  featured_image_url TEXT,
  
  -- SEO
  seo_title TEXT,
  seo_keywords TEXT[],
  focus_keyword TEXT,
  internal_links TEXT[],
  external_links TEXT[],
  
  -- Categorization
  category TEXT,
  tags TEXT[],
  content_pillar TEXT,
  
  -- Publishing
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'archived'
  
  -- Performance Metrics
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER, -- in seconds
  bounce_rate DECIMAL(5,2),
  shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- AI Generation
  generated_by_ai BOOLEAN DEFAULT TRUE,
  generation_prompt TEXT,
  trending_topics_used JSONB[], -- Topics that inspired this post
  
  -- Publishing Integrations
  wordpress_post_id TEXT,
  medium_post_id TEXT,
  external_url TEXT,
  
  -- Author
  author_name TEXT,
  author_bio TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending Topics table (for blog inspiration)
CREATE TABLE public.trending_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Topic Details
  topic TEXT NOT NULL,
  description TEXT,
  keywords TEXT[],
  hashtags TEXT[],
  
  -- Trend Data
  trend_score INTEGER DEFAULT 0, -- 0-100 indicating trending strength
  search_volume INTEGER,
  competition_level TEXT, -- 'low', 'medium', 'high'
  
  -- Sources
  sources JSONB[], -- Where this trend was discovered
  related_topics TEXT[],
  
  -- Relevance
  relevance_score INTEGER DEFAULT 0, -- 0-100 how relevant to company's niche
  relevance_reasons TEXT[],
  
  -- Angles & Ideas
  content_angles JSONB[], -- Different approaches to cover this topic
  suggested_titles TEXT[],
  
  -- Status
  status TEXT DEFAULT 'discovered', -- 'discovered', 'approved', 'in_progress', 'used', 'rejected'
  used_in_blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  
  -- Timing
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trending_until DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Integration Settings table
CREATE TABLE public.email_integration_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Provider Configuration
  provider TEXT NOT NULL, -- 'sendgrid', 'ses', 'smtp', 'mailgun', etc.
  api_key_encrypted TEXT, -- Store encrypted
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password_encrypted TEXT, -- Store encrypted
  
  -- Sender Configuration
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  reply_to_email TEXT,
  
  -- Settings
  daily_send_limit INTEGER DEFAULT 100,
  emails_sent_today INTEGER DEFAULT 0,
  tracking_enabled BOOLEAN DEFAULT TRUE,
  
  -- Compliance
  include_unsubscribe_link BOOLEAN DEFAULT TRUE,
  gdpr_compliant BOOLEAN DEFAULT TRUE,
  footer_text TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id)
);

-- Blog Publishing Settings table
CREATE TABLE public.blog_publishing_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- WordPress Integration
  wordpress_enabled BOOLEAN DEFAULT FALSE,
  wordpress_site_url TEXT,
  wordpress_username TEXT,
  wordpress_app_password_encrypted TEXT,
  
  -- Medium Integration
  medium_enabled BOOLEAN DEFAULT FALSE,
  medium_access_token_encrypted TEXT,
  medium_author_id TEXT,
  
  -- Publishing Preferences
  auto_publish_enabled BOOLEAN DEFAULT FALSE,
  publish_as_draft BOOLEAN DEFAULT TRUE,
  default_category TEXT,
  default_tags TEXT[],
  
  -- SEO Settings
  auto_generate_meta BOOLEAN DEFAULT TRUE,
  auto_generate_slug BOOLEAN DEFAULT TRUE,
  include_author_bio BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id)
);

-- Indexes for new tables
CREATE INDEX idx_leads_company_id ON public.leads(company_id);
CREATE INDEX idx_leads_status ON public.leads(lead_status);
CREATE INDEX idx_leads_score ON public.leads(lead_score DESC);
CREATE INDEX idx_lead_research_sessions_company_id ON public.lead_research_sessions(company_id);
CREATE INDEX idx_email_templates_company_id ON public.email_templates(company_id);
CREATE INDEX idx_email_campaigns_company_id ON public.email_campaigns(company_id);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_outreach_company_id ON public.email_outreach(company_id);
CREATE INDEX idx_email_outreach_lead_id ON public.email_outreach(lead_id);
CREATE INDEX idx_email_outreach_campaign_id ON public.email_outreach(campaign_id);
CREATE INDEX idx_blog_posts_company_id ON public.blog_posts(company_id);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_scheduled_date ON public.blog_posts(scheduled_date);
CREATE INDEX idx_trending_topics_company_id ON public.trending_topics(company_id);
CREATE INDEX idx_trending_topics_status ON public.trending_topics(status);
CREATE INDEX idx_trending_topics_score ON public.trending_topics(trend_score DESC);

-- Row Level Security Policies

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_publishing_settings ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can manage leads for own companies" ON public.leads
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Lead Research Sessions policies
CREATE POLICY "Users can manage research sessions for own companies" ON public.lead_research_sessions
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Email Templates policies
CREATE POLICY "Users can manage email templates for own companies" ON public.email_templates
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Email Campaigns policies
CREATE POLICY "Users can manage email campaigns for own companies" ON public.email_campaigns
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Email Outreach policies
CREATE POLICY "Users can manage email outreach for own companies" ON public.email_outreach
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Blog Posts policies
CREATE POLICY "Users can manage blog posts for own companies" ON public.blog_posts
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Trending Topics policies
CREATE POLICY "Users can manage trending topics for own companies" ON public.trending_topics
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Email Integration Settings policies
CREATE POLICY "Users can manage email settings for own companies" ON public.email_integration_settings
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Blog Publishing Settings policies
CREATE POLICY "Users can manage blog settings for own companies" ON public.blog_publishing_settings
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Triggers for updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_research_sessions_updated_at BEFORE UPDATE ON public.lead_research_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_outreach_updated_at BEFORE UPDATE ON public.email_outreach
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trending_topics_updated_at BEFORE UPDATE ON public.trending_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_integration_settings_updated_at BEFORE UPDATE ON public.email_integration_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_publishing_settings_updated_at BEFORE UPDATE ON public.blog_publishing_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
