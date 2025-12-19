// Marketing Plan Generation Actions

import { supabase } from '@/lib/supabase/client'
import { MarketingPlan, Company, MarketResearch, Goal, ContentPillar, Campaign, KPI } from '@/types'

export async function generateMarketingPlan(
  company: Company,
  research: MarketResearch
): Promise<MarketingPlan | null> {
  try {
    // Generate comprehensive marketing plan based on company and research data
    const plan: Partial<MarketingPlan> = {
      company_id: company.id,
      research_id: research.id,
      title: `${company.name} Social Media Marketing Strategy ${new Date().getFullYear()}`,
      description: `Comprehensive social media marketing plan for ${company.name} in the ${company.industry} industry`,
      
      // SMART Goals
      goals: [
        {
          title: 'Increase Brand Awareness',
          description: 'Grow social media following and reach',
          metric: 'Total followers across platforms',
          target: '25% increase',
          timeframe: '6 months',
          type: 'SMART',
        },
        {
          title: 'Boost Engagement',
          description: 'Increase audience interaction with content',
          metric: 'Average engagement rate',
          target: '5% engagement rate',
          timeframe: '3 months',
          type: 'SMART',
        },
        {
          title: 'Drive Website Traffic',
          description: 'Generate qualified leads through social media',
          metric: 'Social media referral traffic',
          target: '500 monthly visits',
          timeframe: '6 months',
          type: 'SMART',
        },
      ],
      
      // Content Pillars based on company offerings
      content_pillars: generateContentPillars(company, research),
      
      // Campaign Ideas
      campaigns: generateCampaigns(company, research),
      
      // Key Messaging
      key_messaging: [
        company.unique_value_proposition || 'Unique value for customers',
        'Building trust through authentic content',
        'Community-focused engagement',
        'Educational and valuable content',
      ],
      
      // KPIs
      kpis: [
        {
          name: 'Follower Growth',
          metric: 'Total followers',
          target: '25% increase',
          tracking_method: 'Monthly social media analytics',
        },
        {
          name: 'Engagement Rate',
          metric: 'Likes, comments, shares / total followers',
          target: '5%',
          tracking_method: 'Platform analytics',
        },
        {
          name: 'Reach',
          metric: 'Unique accounts reached',
          target: '50,000 monthly',
          tracking_method: 'Platform insights',
        },
        {
          name: 'Website Clicks',
          metric: 'Link clicks from social media',
          target: '500 monthly',
          tracking_method: 'UTM tracking + Google Analytics',
        },
      ],
      
      // Time-based strategies
      daily_strategy: {
        focus: 'Consistent presence and engagement',
        activities: [
          'Monitor and respond to comments/messages',
          'Engage with target audience content',
          'Share Stories or quick updates',
          'Track performance metrics',
        ],
        content_themes: ['Daily tips', 'Behind-the-scenes', 'Quick updates'],
        expected_outcomes: ['Maintain visibility', 'Build relationships', 'Increase engagement'],
      },
      
      weekly_strategy: {
        focus: 'Strategic content distribution',
        activities: [
          `Post ${research.engagement_patterns?.optimal_frequency?.instagram || 5}x on Instagram`,
          `Post ${research.engagement_patterns?.optimal_frequency?.facebook || 4}x on Facebook`,
          `Post ${research.engagement_patterns?.optimal_frequency?.linkedin || 3}x on LinkedIn`,
          'Create 2-3 Reels/short videos',
          'Weekly performance review',
        ],
        content_themes: ['Educational posts', 'Promotional content', 'User stories', 'Industry insights'],
        expected_outcomes: ['Steady growth', 'Consistent engagement', 'Brand awareness'],
      },
      
      monthly_strategy: {
        focus: 'Campaign execution and optimization',
        activities: [
          'Launch monthly campaign/theme',
          'Create long-form content (blog, video)',
          'Collaborate with partners/influencers',
          'Run contests or giveaways',
          'Monthly analytics review and reporting',
        ],
        content_themes: ['Monthly themes', 'Special promotions', 'Customer spotlights', 'Trend participation'],
        expected_outcomes: ['Campaign success', 'Community growth', 'Lead generation'],
      },
      
      yearly_strategy: {
        focus: 'Long-term brand building and growth',
        activities: [
          'Quarterly strategy reviews',
          'Annual campaign planning',
          'Platform expansion (new channels)',
          'Brand partnerships',
          'Year-end review and next year planning',
        ],
        content_themes: ['Seasonal campaigns', 'Annual milestones', 'Brand evolution', 'Community celebrations'],
        expected_outcomes: ['Sustained growth', 'Brand authority', 'Market leadership'],
      },
      
      status: 'draft',
      approved: false,
    }

    // Save to database
    const { data, error } = await supabase
      .from('marketing_plans')
      .insert(plan)
      .select()
      .single()

    if (error) throw error

    return data as MarketingPlan
  } catch (error) {
    console.error('Error generating marketing plan:', error)
    return null
  }
}

function generateContentPillars(company: Company, research: MarketResearch): ContentPillar[] {
  const pillars: ContentPillar[] = [
    {
      name: 'Educational Content',
      description: 'Share valuable tips, tutorials, and industry insights',
      percentage: 40,
      content_types: ['How-to posts', 'Tips and tricks', 'Industry news', 'FAQ content'],
      examples: ['Tutorial videos', 'Infographics', 'Step-by-step guides'],
    },
    {
      name: 'Brand Storytelling',
      description: 'Showcase company culture, values, and behind-the-scenes',
      percentage: 25,
      content_types: ['Behind-the-scenes', 'Team spotlights', 'Company updates', 'Brand values'],
      examples: ['Day in the life', 'Meet the team', 'Company milestones'],
    },
    {
      name: 'Product/Service Promotion',
      description: 'Highlight offerings and drive conversions',
      percentage: 20,
      content_types: ['Product features', 'Special offers', 'Testimonials', 'Case studies'],
      examples: ['Product demos', 'Customer reviews', 'Limited-time offers'],
    },
    {
      name: 'Community Engagement',
      description: 'Build relationships and encourage interaction',
      percentage: 15,
      content_types: ['User-generated content', 'Q&A sessions', 'Polls', 'Contests'],
      examples: ['Customer spotlights', 'Interactive stories', 'Community challenges'],
    },
  ]

  return pillars
}

function generateCampaigns(company: Company, research: MarketResearch): Campaign[] {
  const campaigns: Campaign[] = [
    {
      name: 'Launch Campaign',
      description: 'Announce presence and build initial audience',
      objective: 'Build awareness and grow following',
      duration: '4 weeks',
      platforms: ['instagram', 'facebook', 'linkedin'],
      tactics: [
        'Daily posts introducing the brand',
        'Engagement with target audience',
        'Collaboration with industry peers',
        'Giveaway to boost visibility',
      ],
    },
    {
      name: 'Educational Series',
      description: 'Weekly tips and insights series',
      objective: 'Position as industry expert',
      duration: 'Ongoing',
      platforms: ['instagram', 'linkedin'],
      tactics: [
        'Weekly tips posts',
        'Carousel educational content',
        'Short tutorial videos',
        'Save-worthy infographics',
      ],
    },
    {
      name: 'Customer Stories Campaign',
      description: 'Showcase customer success and testimonials',
      objective: 'Build trust and social proof',
      duration: '8 weeks',
      platforms: ['instagram', 'facebook'],
      tactics: [
        'Customer spotlight posts',
        'Video testimonials',
        'Before/after content',
        'User-generated content features',
      ],
    },
  ]

  // Add trend-based campaigns from research
  if (research.trends && research.trends.length > 0) {
    research.trends.forEach((trend) => {
      if (trend.relevance_score >= 7) {
        campaigns.push({
          name: `${trend.name} Campaign`,
          description: `Leverage trending ${trend.name} for increased visibility`,
          objective: 'Increase reach and engagement',
          duration: trend.timeframe || '4 weeks',
          platforms: trend.platforms || ['instagram'],
          tactics: [
            `Create content aligned with ${trend.name}`,
            'Use trending hashtags and formats',
            'Engage with trend participants',
          ],
        })
      }
    })
  }

  return campaigns
}

export async function approveMarketingPlan(planId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('marketing_plans')
      .update({
        approved: true,
        approved_at: new Date().toISOString(),
        status: 'active',
      })
      .eq('id', planId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error approving plan:', error)
    return { success: false, error: error.message }
  }
}

export async function getMarketingPlan(planId: string): Promise<MarketingPlan | null> {
  try {
    const { data, error } = await supabase
      .from('marketing_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) throw error

    return data as MarketingPlan
  } catch (error) {
    console.error('Error fetching plan:', error)
    return null
  }
}

export async function getCompanyPlans(companyId: string): Promise<MarketingPlan[]> {
  try {
    const { data, error } = await supabase
      .from('marketing_plans')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as MarketingPlan[]
  } catch (error) {
    console.error('Error fetching plans:', error)
    return []
  }
}
