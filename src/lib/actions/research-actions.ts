// Market Research Actions using AI

import { supabase } from '@/lib/supabase/client'
import { MarketResearch, Company, Competitor, Trend } from '@/types'

export async function performMarketResearch(
  company: Company,
  aiGenerateFunction: (prompt: string) => Promise<string>
): Promise<MarketResearch | null> {
  try {
    // Create research prompt based on company data
    const researchPrompt = `
Perform comprehensive market research for the following company:

Company Name: ${company.name}
Industry: ${company.industry}
Description: ${company.description}
Products/Services: ${company.products_services?.join(', ')}
Target Audience: ${JSON.stringify(company.target_audience)}

Please provide a detailed market research analysis in JSON format with the following structure:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "content_strategy": "Brief description of their content approach",
      "engagement_rate": 0.05,
      "posting_frequency": "3-5 times per week"
    }
  ],
  "trends": [
    {
      "name": "Trend Name",
      "description": "Trend description",
      "relevance_score": 8,
      "platforms": ["instagram", "tiktok"],
      "timeframe": "Current"
    }
  ],
  "popular_content_formats": [
    {
      "type": "Reels/Short-form video",
      "platform": "instagram",
      "engagement_rate": 0.08,
      "examples": ["Behind-the-scenes", "Tutorials"]
    }
  ],
  "engagement_patterns": {
    "best_posting_times": {
      "instagram": ["9am", "12pm", "7pm"],
      "facebook": ["10am", "1pm", "8pm"]
    },
    "best_posting_days": {
      "instagram": ["Tuesday", "Wednesday", "Thursday"],
      "facebook": ["Monday", "Wednesday", "Friday"]
    },
    "optimal_frequency": {
      "instagram": 5,
      "facebook": 4,
      "linkedin": 3
    }
  },
  "hashtag_analysis": [
    {
      "hashtag": "#industryspecific",
      "popularity": 85,
      "relevance": 95,
      "competition": "medium",
      "recommended": true
    }
  ],
  "audience_sentiment": {
    "overall": "positive",
    "topics": {
      "sustainability": "positive",
      "pricing": "neutral",
      "customer_service": "positive"
    },
    "common_feedback": ["Quality products", "Great customer support"]
  },
  "opportunities": [
    {
      "title": "Untapped Platform",
      "description": "Limited presence on TikTok despite strong visual products",
      "priority": "high",
      "actionable_steps": ["Create TikTok account", "Post 3x weekly"]
    }
  ],
  "threats": [
    {
      "title": "Increasing Competition",
      "description": "New competitors entering the market",
      "severity": "medium",
      "mitigation": ["Focus on unique value prop", "Increase content frequency"]
    }
  ]
}

Provide realistic, industry-specific insights based on current social media marketing best practices.
`

    // Generate research using AI
    const aiResponse = await aiGenerateFunction(researchPrompt)
    
    // Parse AI response
    let researchData
    try {
      researchData = JSON.parse(aiResponse)
    } catch {
      // If response is not JSON, extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/)
      if (jsonMatch) {
        researchData = JSON.parse(jsonMatch[1])
      } else {
        throw new Error('Failed to parse AI response')
      }
    }

    // Save research to database
    const { data, error } = await supabase
      .from('market_research')
      .insert({
        company_id: company.id,
        competitors: researchData.competitors,
        trends: researchData.trends,
        popular_content_formats: researchData.popular_content_formats,
        engagement_patterns: researchData.engagement_patterns,
        hashtag_analysis: researchData.hashtag_analysis,
        audience_sentiment: researchData.audience_sentiment,
        opportunities: researchData.opportunities,
        threats: researchData.threats,
        status: 'completed',
      })
      .select()
      .single()

    if (error) throw error

    return data as MarketResearch
  } catch (error) {
    console.error('Error performing market research:', error)
    return null
  }
}

export async function getLatestResearch(companyId: string): Promise<MarketResearch | null> {
  try {
    const { data, error } = await supabase
      .from('market_research')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    return data as MarketResearch
  } catch (error) {
    console.error('Error fetching research:', error)
    return null
  }
}

export async function generateCompetitorAnalysis(
  industry: string,
  targetAudience: any,
  aiGenerateFunction: (prompt: string) => Promise<string>
): Promise<Competitor[]> {
  const prompt = `
Identify and analyze 3-5 key competitors in the ${industry} industry targeting ${JSON.stringify(targetAudience)}.

Provide a JSON array of competitors with this structure:
[
  {
    "name": "Competitor Name",
    "url": "website.com",
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "content_strategy": "Description of their social media approach",
    "engagement_rate": 0.045,
    "followers": 50000,
    "posting_frequency": "4-5 times per week"
  }
]
`

  try {
    const response = await aiGenerateFunction(prompt)
    const competitors = JSON.parse(response)
    return competitors
  } catch (error) {
    console.error('Error generating competitor analysis:', error)
    return []
  }
}

export async function identifyTrends(
  industry: string,
  platforms: string[],
  aiGenerateFunction: (prompt: string) => Promise<string>
): Promise<Trend[]> {
  const prompt = `
Identify current social media marketing trends for the ${industry} industry, specifically for these platforms: ${platforms.join(', ')}.

Provide a JSON array of trends with this structure:
[
  {
    "name": "Trend Name",
    "description": "Detailed description of the trend",
    "relevance_score": 8,
    "platforms": ["instagram", "tiktok"],
    "timeframe": "Q1 2024"
  }
]

Focus on actionable trends that can be leveraged for content creation.
`

  try {
    const response = await aiGenerateFunction(prompt)
    const trends = JSON.parse(response)
    return trends
  } catch (error) {
    console.error('Error identifying trends:', error)
    return []
  }
}
