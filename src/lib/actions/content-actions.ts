// Content Generation and Scheduling Actions

import { supabase } from '@/lib/supabase/client'
import { ContentTopic, ContentPost, MarketingPlan, Company, ContentCalendar } from '@/types'
import { addDays, addWeeks, format, startOfWeek } from 'date-fns'

export async function generateContentTopics(
  company: Company,
  plan: MarketingPlan,
  numberOfTopics: number = 30
): Promise<ContentTopic[]> {
  try {
    const topics: Partial<ContentTopic>[] = []
    const startDate = new Date()

    // Distribute topics across content pillars
    plan.content_pillars?.forEach((pillar) => {
      const topicsForPillar = Math.floor((numberOfTopics * pillar.percentage) / 100)

      for (let i = 0; i < topicsForPillar; i++) {
        const dayOffset = Math.floor(topics.length * (30 / numberOfTopics))
        const suggestedDate = addDays(startDate, dayOffset)

        topics.push({
          company_id: company.id,
          plan_id: plan.id,
          title: `${pillar.name}: Topic ${i + 1}`,
          description: `Content idea for ${pillar.name.toLowerCase()}`,
          content_pillar: pillar.name,
          platform: ['instagram', 'facebook'],
          topic_type: getTopicType(pillar.name),
          suggested_date: format(suggestedDate, 'yyyy-MM-dd'),
          priority: Math.floor(Math.random() * 5) + 1,
          status: 'pending',
        })
      }
    })

    // Insert topics into database
    const { data, error } = await supabase
      .from('content_topics')
      .insert(topics)
      .select()

    if (error) throw error

    return data as ContentTopic[]
  } catch (error) {
    console.error('Error generating topics:', error)
    return []
  }
}

export async function generateContentPost(
  topic: ContentTopic,
  company: Company,
  platform: string
): Promise<ContentPost | null> {
  try {
    // Generate platform-optimized content
    const caption = await generateCaption(topic, company, platform)
    const hashtags = await generateHashtags(topic, company, platform)

    const post: Partial<ContentPost> = {
      company_id: company.id,
      topic_id: topic.id,
      plan_id: topic.plan_id,
      platform,
      caption,
      hashtags,
      call_to_action: generateCTA(platform),
      media_type: 'image',
      status: 'draft',
      generated_by_ai: true,
      generation_prompt: `Generate ${platform} post for: ${topic.title}`,
    }

    const { data, error } = await supabase
      .from('content_posts')
      .insert(post)
      .select()
      .single()

    if (error) throw error

    return data as ContentPost
  } catch (error) {
    console.error('Error generating post:', error)
    return null
  }
}

export async function generateBulkPosts(
  company: Company,
  plan: MarketingPlan,
  calendar: ContentCalendar,
  startDate: Date,
  weeks: number = 4
): Promise<ContentPost[]> {
  try {
    const posts: Partial<ContentPost>[] = []
    const platforms = Object.keys(calendar.posting_frequency || {})

    for (let week = 0; week < weeks; week++) {
      const weekStart = addWeeks(startDate, week)

      platforms.forEach((platform) => {
        const frequency = (calendar.posting_frequency as any)?.[platform]?.posts_per_week || 3
        const preferredTimes = (calendar.posting_frequency as any)?.[platform]?.preferred_times || ['9:00', '15:00', '19:00']

        // Distribute posts across the week
        for (let i = 0; i < frequency; i++) {
          const dayOffset = Math.floor((i * 7) / frequency)
          const postDate = addDays(weekStart, dayOffset)
          const time = preferredTimes[i % preferredTimes.length]
          const scheduledDate = new Date(`${format(postDate, 'yyyy-MM-dd')}T${time}:00`)

          // Select content pillar based on distribution
          const pillar = selectContentPillar(plan, posts.length)
          
          posts.push({
            company_id: company.id,
            plan_id: plan.id,
            platform,
            caption: generateSampleCaption(company, platform, pillar),
            hashtags: generateSampleHashtags(platform, company.industry || ''),
            call_to_action: generateCTA(platform),
            media_type: platform === 'instagram' || platform === 'tiktok' ? 'image' : 'text',
            scheduled_date: scheduledDate.toISOString(),
            status: 'scheduled',
            generated_by_ai: true,
          })
        }
      })
    }

    // Insert posts
    const { data, error } = await supabase
      .from('content_posts')
      .insert(posts)
      .select()

    if (error) throw error

    return data as ContentPost[]
  } catch (error) {
    console.error('Error generating bulk posts:', error)
    return []
  }
}

export async function schedulePost(
  postId: string,
  scheduledDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('content_posts')
      .update({
        scheduled_date: scheduledDate.toISOString(),
        status: 'scheduled',
      })
      .eq('id', postId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getContentPosts(
  companyId: string,
  filters?: { status?: string; platform?: string }
): Promise<ContentPost[]> {
  try {
    let query = supabase
      .from('content_posts')
      .select('*')
      .eq('company_id', companyId)
      .order('scheduled_date', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.platform) {
      query = query.eq('platform', filters.platform)
    }

    const { data, error } = await query

    if (error) throw error

    return data as ContentPost[]
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export async function createContentCalendar(
  company: Company,
  plan: MarketingPlan,
  postingFrequency: any
): Promise<ContentCalendar | null> {
  try {
    const startDate = new Date()
    const endDate = addWeeks(startDate, 12) // 3 months

    const calendar: Partial<ContentCalendar> = {
      company_id: company.id,
      plan_id: plan.id,
      name: `${company.name} Content Calendar - ${format(startDate, 'MMM yyyy')}`,
      description: 'AI-generated content calendar',
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      posting_frequency: postingFrequency,
      active: true,
    }

    const { data, error } = await supabase
      .from('content_calendar')
      .insert(calendar)
      .select()
      .single()

    if (error) throw error

    return data as ContentCalendar
  } catch (error) {
    console.error('Error creating calendar:', error)
    return null
  }
}

// Helper functions

function getTopicType(pillarName: string): 'educational' | 'promotional' | 'engagement' | 'story' {
  const lower = pillarName.toLowerCase()
  if (lower.includes('education')) return 'educational'
  if (lower.includes('promotion') || lower.includes('product')) return 'promotional'
  if (lower.includes('engagement') || lower.includes('community')) return 'engagement'
  return 'story'
}

async function generateCaption(topic: ContentTopic, company: Company, platform: string): Promise<string> {
  // This would use AI in production - simplified for now
  const brandVoice = company.brand_voice || 'professional and friendly'
  
  let caption = `${topic.title}\n\n`
  caption += `${topic.description || 'Engaging content for your audience.'}\n\n`
  
  if (platform === 'linkedin') {
    caption += 'What are your thoughts on this? Share in the comments below! 💬'
  } else if (platform === 'instagram') {
    caption += '💡 Save this for later and share with someone who needs to see this!'
  } else {
    caption += '👉 Let us know what you think in the comments!'
  }

  return caption
}

async function generateHashtags(topic: ContentTopic, company: Company, platform: string): Promise<string[]> {
  const baseHashtags = [
    company.industry?.toLowerCase().replace(/\s+/g, '') || 'business',
    'socialmedia',
    'marketing',
  ]

  if (platform === 'instagram') {
    return [...baseHashtags, 'instagood', 'socialmediamarketing', 'digitalmarketing'].slice(0, 10)
  } else if (platform === 'linkedin') {
    return [...baseHashtags, 'business', 'entrepreneurship', 'leadership'].slice(0, 5)
  }

  return baseHashtags
}

function generateCTA(platform: string): string {
  const ctas = {
    instagram: '🔗 Link in bio to learn more!',
    facebook: 'Click the link below to find out more!',
    linkedin: 'Connect with us to stay updated!',
    twitter: 'Visit our website for more details!',
    tiktok: 'Follow for more tips!',
  }

  return ctas[platform as keyof typeof ctas] || 'Learn more!'
}

function selectContentPillar(plan: MarketingPlan, postIndex: number): string {
  if (!plan.content_pillars || plan.content_pillars.length === 0) {
    return 'General Content'
  }

  // Rotate through pillars based on their percentage
  const totalPercentage = plan.content_pillars.reduce((sum, p) => sum + p.percentage, 0)
  const normalizedIndex = (postIndex * 100) % totalPercentage

  let cumulative = 0
  for (const pillar of plan.content_pillars) {
    cumulative += pillar.percentage
    if (normalizedIndex < cumulative) {
      return pillar.name
    }
  }

  return plan.content_pillars[0].name
}

function generateSampleCaption(company: Company, platform: string, pillar: string): string {
  const captions = {
    'Educational Content': `💡 Quick tip for ${company.industry} success!\n\nHere's something you should know...\n\nSave this post for later! 📌`,
    'Brand Storytelling': `Behind the scenes at ${company.name}! 🎬\n\nWe're passionate about what we do, and here's why...\n\n#BehindTheScenes`,
    'Product/Service Promotion': `✨ Exciting news!\n\nCheck out what we've been working on...\n\nLimited time offer - don't miss out! 🔥`,
    'Community Engagement': `We love our community! ❤️\n\nTell us: What's your favorite thing about [topic]?\n\nComment below! 👇`,
  }

  return captions[pillar as keyof typeof captions] || `Great content from ${company.name}! Check it out! 🚀`
}

function generateSampleHashtags(platform: string, industry: string): string[] {
  const industryTag = industry.toLowerCase().replace(/\s+/g, '')
  
  const commonTags = [industryTag, 'business', 'entrepreneur', 'success', 'growth']
  
  if (platform === 'instagram') {
    return [...commonTags, 'instagood', 'instadaily', 'motivation', 'inspiration', 'lifestyle']
  } else if (platform === 'linkedin') {
    return [...commonTags, 'leadership', 'innovation', 'professional']
  } else if (platform === 'tiktok') {
    return [...commonTags, 'viral', 'trending', 'fyp']
  }

  return commonTags.slice(0, 5)
}
