-- Shakes Digital Marketing Suite Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'agency', 'admin'
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies/Businesses table
CREATE TABLE public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  products_services TEXT[],
  unique_value_proposition TEXT,
  brand_voice TEXT,
  brand_guidelines JSONB,
  website_url TEXT,
  logo_url TEXT,
  
  -- Target Audience
  target_audience JSONB, -- {demographics, psychographics, pain_points, behaviors}
  
  -- Social Media Accounts
  social_accounts JSONB, -- {platform: {username, url, connected: boolean}}
  
  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Research table
CREATE TABLE public.market_research (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Research Data
  competitors JSONB[], -- Array of competitor analysis
  trends JSONB[], -- Current market trends
  popular_content_formats JSONB[],
  engagement_patterns JSONB,
  hashtag_analysis JSONB[],
  audience_sentiment JSONB,
  opportunities JSONB[],
  threats JSONB[],
  
  -- Metadata
  research_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'completed', -- 'pending', 'in_progress', 'completed', 'failed'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Plans table
CREATE TABLE public.marketing_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  research_id UUID REFERENCES public.market_research(id) ON DELETE SET NULL,
  
  -- Plan Details
  title TEXT NOT NULL,
  description TEXT,
  goals JSONB[], -- Array of SMART goals
  content_pillars JSONB[], -- Main content themes
  campaigns JSONB[], -- Campaign ideas
  key_messaging TEXT[],
  kpis JSONB[], -- Key performance indicators
  
  -- Time-based strategies
  daily_strategy JSONB,
  weekly_strategy JSONB,
  monthly_strategy JSONB,
  yearly_strategy JSONB,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'archived'
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Topics table
CREATE TABLE public.content_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.marketing_plans(id) ON DELETE CASCADE,
  
  -- Topic Details
  title TEXT NOT NULL,
  description TEXT,
  content_pillar TEXT,
  platform TEXT[], -- ['instagram', 'twitter', 'linkedin', 'facebook']
  topic_type TEXT, -- 'educational', 'promotional', 'engagement', 'story'
  keywords TEXT[],
  hashtags TEXT[],
  
  -- Scheduling
  suggested_date DATE,
  priority INTEGER DEFAULT 0, -- 0-5 priority level
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'used'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Posts table
CREATE TABLE public.content_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.content_topics(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES public.marketing_plans(id) ON DELETE SET NULL,
  
  -- Post Content
  platform TEXT NOT NULL, -- 'instagram', 'twitter', 'linkedin', 'facebook', 'tiktok'
  caption TEXT NOT NULL,
  hashtags TEXT[],
  call_to_action TEXT,
  media_urls TEXT[],
  media_type TEXT, -- 'image', 'video', 'carousel', 'text'
  
  -- Scheduling
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published', 'failed'
  
  -- Engagement metrics (populated after publishing)
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  
  -- AI generation metadata
  generated_by_ai BOOLEAN DEFAULT TRUE,
  generation_prompt TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Calendar table (for organizing and viewing schedule)
CREATE TABLE public.content_calendar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.marketing_plans(id) ON DELETE CASCADE,
  
  -- Calendar Configuration
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Platform-specific posting frequency
  posting_frequency JSONB, -- {platform: {posts_per_week: number, preferred_times: []}}
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Settings table
CREATE TABLE public.automation_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  
  -- Automation Configuration
  auto_generation_enabled BOOLEAN DEFAULT FALSE,
  auto_scheduling_enabled BOOLEAN DEFAULT FALSE,
  auto_publishing_enabled BOOLEAN DEFAULT FALSE,
  
  -- Generation settings
  generation_frequency TEXT, -- 'daily', 'weekly', 'monthly'
  content_approval_required BOOLEAN DEFAULT TRUE,
  
  -- Platform settings
  platforms_enabled JSONB, -- {platform: boolean}
  
  -- Notification settings
  notify_on_generation BOOLEAN DEFAULT TRUE,
  notify_on_publish BOOLEAN DEFAULT TRUE,
  notification_email TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id)
);

-- Chatbot Conversations table (for CopilotKit context)
CREATE TABLE public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Conversation Data
  messages JSONB[], -- Array of message objects
  context JSONB, -- Current conversation context
  intent TEXT, -- 'onboarding', 'research', 'planning', 'content_creation'
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_market_research_company_id ON public.market_research(company_id);
CREATE INDEX idx_marketing_plans_company_id ON public.marketing_plans(company_id);
CREATE INDEX idx_content_topics_company_id ON public.content_topics(company_id);
CREATE INDEX idx_content_topics_status ON public.content_topics(status);
CREATE INDEX idx_content_posts_company_id ON public.content_posts(company_id);
CREATE INDEX idx_content_posts_scheduled_date ON public.content_posts(scheduled_date);
CREATE INDEX idx_content_posts_status ON public.content_posts(status);
CREATE INDEX idx_content_calendar_company_id ON public.content_calendar(company_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_company_id ON public.conversations(company_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "Users can view own companies" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies" ON public.companies
  FOR DELETE USING (auth.uid() = user_id);

-- Market Research policies
CREATE POLICY "Users can view research for own companies" ON public.market_research
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert research for own companies" ON public.market_research
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Marketing Plans policies
CREATE POLICY "Users can view plans for own companies" ON public.marketing_plans
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert plans for own companies" ON public.marketing_plans
  FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update plans for own companies" ON public.marketing_plans
  FOR UPDATE USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Content Topics policies
CREATE POLICY "Users can view topics for own companies" ON public.content_topics
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage topics for own companies" ON public.content_topics
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Content Posts policies
CREATE POLICY "Users can view posts for own companies" ON public.content_posts
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage posts for own companies" ON public.content_posts
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Content Calendar policies
CREATE POLICY "Users can view calendars for own companies" ON public.content_calendar
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage calendars for own companies" ON public.content_calendar
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Automation Settings policies
CREATE POLICY "Users can view automation for own companies" ON public.automation_settings
  FOR SELECT USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage automation for own companies" ON public.automation_settings
  FOR ALL USING (
    company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())
  );

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_research_updated_at BEFORE UPDATE ON public.market_research
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_plans_updated_at BEFORE UPDATE ON public.marketing_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_topics_updated_at BEFORE UPDATE ON public.content_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_posts_updated_at BEFORE UPDATE ON public.content_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at BEFORE UPDATE ON public.content_calendar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_settings_updated_at BEFORE UPDATE ON public.automation_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
