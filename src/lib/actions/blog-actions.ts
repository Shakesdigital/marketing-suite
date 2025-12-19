// Blog Content Generation and Trending Topics Actions
'use server'

import { createClient } from '@/lib/supabase/server'
import { BlogPost, TrendingTopic, ContentAngle } from '@/types/blog'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Research trending topics relevant to company's niche
 * Uses AI to discover current trends and content opportunities
 */
export async function researchTrendingTopics(
  companyId: string,
  count: number = 10
): Promise<{ success: boolean; topics?: TrendingTopic[]; error?: string }> {
  try {
    const supabase = createClient()

    // Get company details for context
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) {
      return { success: false, error: 'Company not found' }
    }

    const prompt = `Research and identify ${count} trending topics and content opportunities for a business in this niche:

Company Context:
- Name: ${company.name}
- Industry: ${company.industry}
- Description: ${company.description}
- Target Audience: ${JSON.stringify(company.target_audience || {})}
- Content Pillars: ${company.brand_guidelines?.content_pillars?.join(', ') || 'General business topics'}

Requirements:
1. Find topics that are currently trending or gaining traction
2. Ensure topics are relevant to the company's niche and audience
3. Prioritize topics with good search volume and engagement potential
4. Consider SEO opportunities (balance between competition and volume)
5. Include diverse topic types (how-to, listicles, case studies, opinion pieces, etc.)

For each topic, provide:
- topic: Clear, engaging topic title
- description: 2-3 sentence overview
- keywords: 5-7 relevant SEO keywords
- hashtags: 3-5 relevant hashtags
- trend_score: 0-100 indicating trending strength
- search_volume: Estimated monthly searches (number)
- competition_level: low, medium, or high
- relevance_score: 0-100 for relevance to company
- relevance_reasons: Array of 2-3 reasons why it's relevant
- content_angles: Array of 2-3 different angles to approach the topic
- suggested_titles: Array of 3-5 compelling blog post titles

Return ONLY valid JSON with a "topics" array.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a content strategy expert specializing in trend analysis and SEO. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')
    const discoveredTopics = response.topics || []

    // Insert topics into database
    const topicsToInsert = discoveredTopics.map((topic: any) => ({
      company_id: companyId,
      topic: topic.topic,
      description: topic.description,
      keywords: topic.keywords || [],
      hashtags: topic.hashtags || [],
      trend_score: topic.trend_score || 50,
      search_volume: topic.search_volume,
      competition_level: topic.competition_level || 'medium',
      relevance_score: topic.relevance_score || 50,
      relevance_reasons: topic.relevance_reasons || [],
      content_angles: topic.content_angles || [],
      suggested_titles: topic.suggested_titles || [],
      status: 'discovered',
      discovered_at: new Date().toISOString(),
    }))

    const { data: insertedTopics, error } = await supabase
      .from('trending_topics')
      .insert(topicsToInsert)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, topics: insertedTopics }
  } catch (error: any) {
    console.error('Error researching trending topics:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate a complete blog post from a trending topic
 */
export async function generateBlogPost(
  companyId: string,
  topicId?: string,
  customTopic?: string,
  customTitle?: string
): Promise<{ success: boolean; blogPost?: BlogPost; error?: string }> {
  try {
    const supabase = createClient()

    // Get company details
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) {
      return { success: false, error: 'Company not found' }
    }

    let topic: TrendingTopic | null = null
    let topicContext = ''
    let title = customTitle || ''

    if (topicId) {
      const { data: topicData } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('id', topicId)
        .single()

      topic = topicData
      topicContext = `Topic: ${topic?.topic}\nDescription: ${topic?.description}\nKeywords: ${topic?.keywords?.join(', ')}`
      title = title || topic?.suggested_titles?.[0] || topic?.topic || ''
    } else if (customTopic) {
      topicContext = `Topic: ${customTopic}`
      title = title || customTopic
    }

    const prompt = `Write a comprehensive, SEO-optimized blog post for this business:

Company Context:
- Name: ${company.name}
- Industry: ${company.industry}
- Description: ${company.description}
- Brand Voice: ${company.brand_voice || 'professional and engaging'}
- Target Audience: ${JSON.stringify(company.target_audience || {})}

${topicContext}

Blog Post Requirements:
- Title: ${title}
- Length: 1500-2500 words
- Tone: ${company.brand_voice || 'professional and engaging'}
- Structure: Introduction, multiple H2/H3 sections, conclusion
- SEO: Naturally incorporate keywords throughout
- Value: Provide actionable insights and practical advice
- Engagement: Use examples, statistics, and storytelling
- Format: Markdown with proper headers, lists, and emphasis

Additional Elements to Include:
- Meta description (150-160 characters)
- Excerpt (150-200 words)
- 5-7 SEO keywords
- Focus keyword
- 3-5 internal link suggestions (generic topics like "our services", "about us", etc.)
- 2-3 authoritative external link suggestions
- Relevant category and tags

Return JSON with these fields:
{
  "title": "Compelling blog post title",
  "content": "Full blog post in Markdown format",
  "excerpt": "Engaging excerpt",
  "meta_description": "SEO meta description",
  "seo_keywords": ["keyword1", "keyword2", ...],
  "focus_keyword": "main keyword",
  "internal_links": ["link1", "link2", ...],
  "external_links": ["url1", "url2", ...],
  "category": "category name",
  "tags": ["tag1", "tag2", ...],
  "slug": "url-friendly-slug"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer and SEO specialist. Create engaging, well-researched blog posts that rank well and provide value to readers. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    const blogData = JSON.parse(completion.choices[0]?.message?.content || '{}')

    // Insert blog post into database
    const { data: blogPost, error } = await supabase
      .from('blog_posts')
      .insert({
        company_id: companyId,
        title: blogData.title || title,
        slug: blogData.slug,
        meta_description: blogData.meta_description,
        content: blogData.content,
        excerpt: blogData.excerpt,
        seo_title: blogData.title,
        seo_keywords: blogData.seo_keywords || [],
        focus_keyword: blogData.focus_keyword,
        internal_links: blogData.internal_links || [],
        external_links: blogData.external_links || [],
        category: blogData.category,
        tags: blogData.tags || [],
        status: 'draft',
        generated_by_ai: true,
        generation_prompt: topicContext,
        trending_topics_used: topic ? [topic] : [],
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Update topic status if used
    if (topicId && topic) {
      await supabase
        .from('trending_topics')
        .update({
          status: 'used',
          used_in_blog_post_id: blogPost.id,
        })
        .eq('id', topicId)
    }

    return { success: true, blogPost }
  } catch (error: any) {
    console.error('Error generating blog post:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all blog posts for a company
 */
export async function getBlogPosts(companyId: string): Promise<BlogPost[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Get all trending topics for a company
 */
export async function getTrendingTopics(companyId: string): Promise<TrendingTopic[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('trending_topics')
    .select('*')
    .eq('company_id', companyId)
    .order('trend_score', { ascending: false })

  return data || []
}

/**
 * Update blog post
 */
export async function updateBlogPost(
  postId: string,
  updates: Partial<BlogPost>
): Promise<{ success: boolean; blogPost?: BlogPost; error?: string }> {
  try {
    const supabase = createClient()

    const { data: blogPost, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, blogPost }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Schedule blog post for publishing
 */
export async function scheduleBlogPost(
  postId: string,
  scheduledDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('blog_posts')
      .update({
        scheduled_date: scheduledDate,
        status: 'scheduled',
      })
      .eq('id', postId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Optimize existing blog post for SEO
 */
export async function optimizeBlogPostSEO(
  postId: string
): Promise<{ success: boolean; optimizations?: any; error?: string }> {
  try {
    const supabase = createClient()

    const { data: post } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (!post) {
      return { success: false, error: 'Blog post not found' }
    }

    const prompt = `Analyze and optimize this blog post for SEO:

Title: ${post.title}
Content: ${post.content?.substring(0, 2000)}...
Current Keywords: ${post.seo_keywords?.join(', ') || 'None'}

Provide SEO optimization recommendations:
1. Improved meta description (150-160 chars)
2. Better focus keyword
3. Additional relevant keywords (5-7 total)
4. Title optimization suggestions
5. Content structure improvements
6. Internal linking opportunities
7. External linking recommendations

Return JSON with optimizations and explanations.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an SEO expert providing actionable optimization recommendations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    })

    const optimizations = JSON.parse(completion.choices[0]?.message?.content || '{}')

    return { success: true, optimizations }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Generate content calendar for blog posts
 */
export async function generateBlogContentCalendar(
  companyId: string,
  monthsAhead: number = 3,
  postsPerWeek: number = 2
): Promise<{ success: boolean; calendar?: any[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) {
      return { success: false, error: 'Company not found' }
    }

    // Get existing trending topics
    const { data: topics } = await supabase
      .from('trending_topics')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'discovered')
      .order('trend_score', { ascending: false })
      .limit(monthsAhead * 4 * postsPerWeek)

    const totalPosts = monthsAhead * 4 * postsPerWeek

    const prompt = `Create a ${monthsAhead}-month blog content calendar for this business:

Company: ${company.name}
Industry: ${company.industry}
Posts per week: ${postsPerWeek}
Total posts needed: ${totalPosts}

${topics && topics.length > 0 ? `Available trending topics:\n${topics.map((t: TrendingTopic) => `- ${t.topic}`).join('\n')}` : ''}

Create a strategic content calendar with:
1. Balanced content mix (educational, promotional, thought leadership)
2. SEO optimization (mix of high and low competition keywords)
3. Seasonal relevance
4. Content pillar coverage
5. Strategic timing for maximum impact

For each post, provide:
- week: Week number (1-${monthsAhead * 4})
- topic: Clear topic
- title: Compelling title
- type: Content type (how-to, listicle, case study, opinion, etc.)
- keywords: Primary keywords
- priority: high, medium, or low
- estimated_publish_date: Date string (YYYY-MM-DD)

Return JSON with "calendar" array of ${totalPosts} posts.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a content strategist creating comprehensive blog calendars.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')

    return { success: true, calendar: response.calendar || [] }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase.from('blog_posts').delete().eq('id', postId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Update trending topic status
 */
export async function updateTopicStatus(
  topicId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('trending_topics')
      .update({ status })
      .eq('id', topicId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Publish blog post to WordPress
 */
export async function publishToWordPress(
  postId: string
): Promise<{ success: boolean; wordpressPostId?: string; error?: string }> {
  try {
    const supabase = createClient()

    const { data: post } = await supabase
      .from('blog_posts')
      .select('*, companies!inner(id)')
      .eq('id', postId)
      .single()

    if (!post) {
      return { success: false, error: 'Blog post not found' }
    }

    const { data: settings } = await supabase
      .from('blog_publishing_settings')
      .select('*')
      .eq('company_id', post.company_id)
      .single()

    if (!settings?.wordpress_enabled) {
      return { success: false, error: 'WordPress integration not configured' }
    }

    // Note: Actual WordPress API integration would go here
    // This is a placeholder showing the structure

    /*
    const wordpressResponse = await fetch(`${settings.wordpress_site_url}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${settings.wordpress_username}:${settings.wordpress_app_password_encrypted}`).toString('base64')}`,
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        status: settings.publish_as_draft ? 'draft' : 'publish',
        excerpt: post.excerpt,
        categories: [settings.default_category],
        tags: post.tags,
      }),
    })
    */

    // Placeholder success
    const mockWordPressId = `wp-${Date.now()}`

    await supabase
      .from('blog_posts')
      .update({
        wordpress_post_id: mockWordPressId,
        status: 'published',
        published_date: new Date().toISOString(),
      })
      .eq('id', postId)

    return { success: true, wordpressPostId: mockWordPressId }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
